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
    setIsAdmin(!!getAuthToken());
  }, []);

  const loadDaily = async () => {
    const token = getAuthToken();
    if (!token) { setErrorMessage('Anda harus login sebagai admin untuk melihat laporan ini'); return; }
    let data: any;
    try {
      const res = await authFetch(`/reports/daily/json?date=${encodeURIComponent(date)}`, { method: 'GET' }, token || undefined);
      if (!res.ok) {
        setErrorMessage('Failed to fetch daily data');
        const body = await res.text().catch(() => null);
        console.error('Daily fetch failed', res.status, body);
        return;
      }
      data = await res.json();
      // Continue processing inside scope
    } catch (err: any) {
      setErrorMessage(String(err.message || err));
      console.error('Daily fetch error', err);
      return;
    }
    // Create hourly summary
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const vals = hours.map((h) => {
      const total = (data.sales || []).filter((s: any) => new Date(s.date).getHours() === h).reduce((a: number, s: any) => a + s.total, 0);
      return total;
    });
    setChartData({ labels: hours.map(h => `${h}:00`), datasets: [{ label: `Penjualan ${date}`, data: vals, backgroundColor: 'rgba(31,122,235,0.6)' }] });
    setSummary({ totalSales: (data.sales || []).reduce((a: number, s: any) => a + s.total, 0), transactions: (data.sales || []).length });
  };

  const loadMonthly = async () => {
    const token = getAuthToken();
    if (!token) { setErrorMessage('Anda harus login sebagai admin untuk melihat laporan ini'); return; }
    let data: any;
    try {
      const res = await authFetch(`/reports/monthly/json?year=${year}&month=${String(month)}`, { method: 'GET' }, token || undefined);
      if (!res.ok) {
        setErrorMessage('Failed to fetch monthly data');
        const body = await res.text().catch(() => null);
        console.error('Monthly fetch failed', res.status, body);
        return;
      }
      data = await res.json();
    } catch (err: any) {
      setErrorMessage(String(err.message || err));
      console.error('Monthly fetch error', err);
      return;
    }
    const dayKeys = Object.keys(data.dailySummary).sort();
    const labels = dayKeys.map(d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric' }));
    const vals = dayKeys.map(k => data.dailySummary[k]);
    setChartData({ labels, datasets: [{ label: `Penjualan ${month}/${year}`, data: vals, backgroundColor: 'rgba(31,122,235,0.6)' }] });
    setSummary({ totalSales: vals.reduce((a: number, b: number) => a + b, 0), transactions: (data.sales || []).length });
  };

  const loadYearly = async () => {
    const token = getAuthToken();
    if (!token) { setErrorMessage('Anda harus login sebagai admin untuk melihat laporan ini'); return; }
    let data: any;
    try {
      const res = await authFetch(`/reports/yearly/json?year=${year}`, { method: 'GET' }, token || undefined);
      if (!res.ok) {
        setErrorMessage('Failed to fetch yearly data');
        const body = await res.text().catch(() => null);
        console.error('Yearly fetch failed', res.status, body);
        return;
      }
      data = await res.json();
    } catch (err: any) {
      setErrorMessage(String(err.message || err));
      console.error('Yearly fetch error', err);
      return;
    }
    const monthKeys = Object.keys(data.monthlyTotals).sort();
    const labels = monthKeys.map(m => new Date(`${year}-${m}-01`).toLocaleString('id-ID', { month: 'short' }));
    const vals = monthKeys.map(k => data.monthlyTotals[k]);
    setChartData({ labels, datasets: [{ label: `Penjualan ${year}`, data: vals, backgroundColor: 'rgba(31,122,235,0.6)' }] });
    setSummary({ totalSales: vals.reduce((a: number, b: number) => a + b, 0), transactions: (data.sales || []).length });
  };

  const downloadPdf = async () => {
    const token = getAuthToken();
    let path = '';
    if (mode === 'daily') path = `/reports/daily?date=${encodeURIComponent(date)}`;
    if (mode === 'monthly') path = `/reports/monthly?year=${year}&month=${String(month)}`;
    if (mode === 'yearly') path = `/reports/yearly?year=${year}`;
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
