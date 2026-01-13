"use client";

import { useEffect, useState } from 'react';
import Header from '../../../app/components/Header';
import { getAuthToken } from '../../../lib/clientAuth';
import { authFetch } from '../../../lib/api';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function formatCurrency(num: number) {
  // Mengubah angka (misal: 1500000) menjadi format Rupiah (Rp1.500.000,00)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
}

// page laporan penjualan untuk admin
export default function ReportsPage() {
  // Menentukan jenis laporan: apakah mau lihat harian, bulanan, atau tahunan
  const [mode, setMode] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  // State untuk memfilter waktu (tanggal spesifik, tahun, atau bulan tertentu)
  const [date, setDate] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  // Menyimpan data untuk grafik (misal: grafik batang atau garis penjualan)
  const [chartData, setChartData] = useState(null as any);
  // Menyimpan ringkasan angka (misal: total omzet, total barang terjual)
  const [summary, setSummary] = useState<any>(null);
  // Status keamanan untuk memastikan yang melihat adalah admin
  const [isAdmin, setIsAdmin] = useState(false);
  // Menyimpan pesan jika terjadi kesalahan saat menarik data laporan
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Set tanggal otomatis ke hari ini (format: YYYY-MM-DD)
    // slice(0, 10) mengambil 10 karakter pertama: contoh "2026-01-13"
    setDate(new Date().toISOString().slice(0, 10));
    // Cek apakah pengguna adalah admin
    // Tanda !! mengubah nilai token (ada/tidak) menjadi boolean (true/false)
    setIsAdmin(!!getAuthToken());
  }, []);

  const loadDaily = async () => {
    const token = getAuthToken();
    // Keamanan: Cek apakah token ada sebelum memanggil server
    if (!token) { setErrorMessage('Anda harus login sebagai admin untuk melihat laporan ini'); return; }
    let data: any;
    try {
      // Ambil data dari API untuk tanggal tertentu
      const res = await authFetch(`/reports/daily/json?date=${encodeURIComponent(date)}`, { method: 'GET' }, token || undefined);
      if (!res.ok) {
        setErrorMessage('Failed to fetch daily data');
        const body = await res.text().catch(() => null);
        console.error('Daily fetch failed', res.status, body);
        return;
      }
      data = await res.json();
    } catch (err: any) {
      setErrorMessage(String(err.message || err));
      console.error('Daily fetch error', err);
      return;
    }
    // MEMBUAT GRAFIK PER JAM
    // Buat deret angka 0 sampai 23 (untuk 24 jam)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    // Filter data transaksi: masukkan setiap transaksi ke "keranjang" jam yang sesuai
    const vals = hours.map((h) => {
      const total = (data.sales || []).filter((s: any) => new Date(s.date).getHours() === h).reduce((a: number, s: any) => a + s.total, 0);
      return total;
    });
    // Simpan hasil ke state untuk ditampilkan di Grafik
    setChartData({ labels: hours.map(h => `${h}:00`), datasets: [{ label: `Penjualan ${date}`, data: vals, backgroundColor: 'rgba(31,122,235,0.6)' }] });
    // Simpan ringkasan: Total Uang dan Total Transaksi
    setSummary({ totalSales: (data.sales || []).reduce((a: number, s: any) => a + s.total, 0), transactions: (data.sales || []).length });
  };

  const loadMonthly = async () => {
    // Ambil kunci akses (token) dari penyimpanan lokal
    const token = getAuthToken();
    // Validasi: Jika token tidak ditemukan, hentikan proses dan beri peringatan
    if (!token) { setErrorMessage('Anda harus login sebagai admin untuk melihat laporan ini'); return; }
    // Siapkan variabel kosong untuk menampung hasil dari server nanti
    let data: any;
    try {
      // Mengambil data dari server dengan menyertakan parameter Tahun, Bulan, dan Token
      const res = await authFetch(`/reports/monthly/json?year=${year}&month=${String(month)}`, { method: 'GET' }, token || undefined);
      // Jika respon server bukan "OK" (misal error 404 atau 500)
      if (!res.ok) {
        setErrorMessage('Failed to fetch monthly data');
        // Mencoba membaca detail pesan error dari body respon untuk bantuan debug.
        const body = await res.text().catch(() => null);
        console.error('Monthly fetch failed', res.status, body);
        return;
      }
      // Jika sukses, ubah format respon mentah menjadi objek JSON
      data = await res.json();
    } catch (err: any) {
      // Tampilkan pesan kesalahan ke layar agar admin tahu ada masalah
      setErrorMessage(String(err.message || err));
      // Catat detail teknis di konsol untuk keperluan perbaikan (debugging)
      console.error('Monthly fetch error', err);
      // Keluar dari fungsi agar aplikasi tidak mencoba mengolah data yang tidak ada
      return;
    }
    // Ambil semua tanggal (key) dari ringkasan harian dan urutkan dari tanggal awal ke akhir
    const dayKeys = Object.keys(data.dailySummary).sort();
    // Buat label untuk sumbu X grafik (hanya mengambil angka tanggalnya saja, misal: 1, 2, 3...)
    const labels = dayKeys.map(d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric' }));
    // Ambil nilai uang (value) untuk setiap tanggal tersebut untuk mengisi tinggi batang grafik
    const vals = dayKeys.map(k => data.dailySummary[k]);
    // Masukkan data yang sudah siap ke dalam state ChartData untuk digambar oleh library grafik
    setChartData({ labels, datasets: [{ label: `Penjualan ${month}/${year}`, data: vals, backgroundColor: 'rgba(31,122,235,0.6)' }] });
    // Hitung ringkasan akhir: total omzet sebulan dan jumlah transaksi yang terjadi
    setSummary({ totalSales: vals.reduce((a: number, b: number) => a + b, 0), transactions: (data.sales || []).length });
  };

  const loadYearly = async () => {
    const token = getAuthToken();
    // Keamanan: Pastikan hanya admin bertoken yang bisa menarik data keuangan tahunan
    if (!token) { setErrorMessage('Anda harus login sebagai admin untuk melihat laporan ini'); return; }
    let data: any;
    try {
      // Ambil data dari server berdasarkan parameter Tahun (misal: 2026)
      const res = await authFetch(`/reports/yearly/json?year=${year}`, { method: 'GET' }, token || undefined);
      if (!res.ok) {
        setErrorMessage('Failed to fetch yearly data');
        const body = await res.text().catch(() => null);
        console.error('Yearly fetch failed', res.status, body);
        return;
      }
      data = await res.json();
    } catch (err: any) {
      // Tangkap error dan tampilkan pesan yang bisa dibaca admin
      // Menggunakan String() untuk memastikan apa pun jenis errornya bisa tampil sebagai teks
      setErrorMessage(String(err.message || err));
      // Catat detail teknis di log developer
      // Ini membantu kamu melacak apakah errornya karena server mati atau format data salah
      console.error('Yearly fetch error', err);
      // Hentikan sisa kode di bawahnya
      // Karena 'data' gagal diambil, kita tidak boleh lanjut ke bagian pembuatan grafik
      return;
    }
    // Ambil semua kunci bulan (01, 02, dst) dari data server dan urutkan
    const monthKeys = Object.keys(data.monthlyTotals).sort();
    // Ubah format angka bulan menjadi nama pendek (misal: "01" jadi "Jan")
    const labels = monthKeys.map(m => new Date(`${year}-${m}-01`).toLocaleString('id-ID', { month: 'short' }));
    // Ambil total nilai penjualan untuk setiap bulan tersebut
    const vals = monthKeys.map(k => data.monthlyTotals[k]);
    // Kirim data yang sudah rapi ke state grafik untuk ditampilkan di layar
    setChartData({ labels, datasets: [{ label: `Penjualan ${year}`, data: vals, backgroundColor: 'rgba(31,122,235,0.6)' }] });
    // Hitung ringkasan akhir: akumulasi omzet setahun dan jumlah total transaksi
    setSummary({ totalSales: vals.reduce((a: number, b: number) => a + b, 0), transactions: (data.sales || []).length });
  };

  const downloadPdf = async () => {
    // Ambil token keamanan
    const token = getAuthToken();
    let path = '';
    // Pemilihan Jalur (Routing): Menentukan alamat API yang tepat
    if (mode === 'daily') path = `/reports/daily?date=${encodeURIComponent(date)}`;
    if (mode === 'monthly') path = `/reports/monthly?year=${year}&month=${String(month)}`;
    if (mode === 'yearly') path = `/reports/yearly?year=${year}`;
    // Batalkan jika mode tidak dikenal atau kosong
    if (!path) return;
    if (!token) { setErrorMessage('Anda harus login sebagai admin untuk mendownload PDF laporan'); return; }
    try {
      const res = await authFetch(path, { method: 'GET' }, token || undefined);
      if (!res || !res.ok) {
        setErrorMessage('Failed to download PDF');
        const body = await res.text().catch(() => null);
        console.error('Download PDF failed', res?.status, body);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (err: any) {
      setErrorMessage(String(err?.message || err));
      console.error('Download PDF error', err);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Laporan Penjualan</h1>
        <div className="flex gap-2 mb-6">
          <button className={`btn ${mode === 'daily' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('daily')}>Harian</button>
          <button className={`btn ${mode === 'monthly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('monthly')}>Bulanan</button>
          <button className={`btn ${mode === 'yearly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('yearly')}>Tahunan</button>
        </div>

        {mode === 'daily' && (
          <div className="card p-4 mb-6">
            <label className="block mb-2">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded-md px-3 py-2" />
            <div className="mt-4 flex gap-2">
              <button className="btn-primary" onClick={loadDaily}>Load Chart</button>
              <button className="btn-ghost" onClick={downloadPdf}>Download PDF</button>
            </div>
          </div>
        )}

        {mode === 'monthly' && (
          <div className="card p-4 mb-6">
            <label className="block mb-2">Bulan, Tahun</label>
            <div className="flex gap-2">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border rounded-md px-3 py-2">
                {Array.from({ length: 12 }, (_, idx) => <option key={idx} value={idx + 1}>{idx + 1}</option>)}
              </select>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded-md px-3 py-2" />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary" onClick={loadMonthly}>Load Chart</button>
              <button className="btn-ghost" onClick={downloadPdf}>Download PDF</button>
            </div>
          </div>
        )}

        {mode === 'yearly' && (
          <div className="card p-4 mb-6">
            <label className="block mb-2">Tahun</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded-md px-3 py-2" />
            <div className="mt-4 flex gap-2">
              <button className="btn-primary" onClick={loadYearly}>Load Chart</button>
              <button className="btn-ghost" onClick={downloadPdf}>Download PDF</button>
            </div>
          </div>
        )}

        <div className="card p-4">
          {chartData ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Grafik</h2>
                <div className="text-sm text-gray-500">Total: {summary ? formatCurrency(summary.totalSales) : '-'}</div>
              </div>
              <div className="w-full" style={{ maxHeight: 360 }}>
                <Bar data={chartData} />
              </div>
            </div>
          ) : (
            <div>
              {errorMessage ? (
                <div className="text-red-600">{errorMessage}</div>
              ) : (
                <div>Silakan pilih periode dan klik "Load Chart" untuk menampilkan grafik.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
