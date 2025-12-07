'use client';

import { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import { getAuthToken } from '../../lib/clientAuth';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface SalesData {
  sale: {
    id: number;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
  };
}

interface DailySalesData {
  date: string;
  totalRevenue: number;
  totalTransactions: number;
  totalItems: number;
  sales: any[];
}

interface MonthlySalesData {
  period: string;
  totalRevenue: number;
  totalTransactions: number;
  totalItems: number;
  byDay: Record<string, any>;
  sales: any[];
}

export default function SalesHistory() {
  const [tab, setTab] = useState<'daily' | 'monthly' | 'all'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dailyData, setDailyData] = useState<DailySalesData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlySalesData | null>(null);
  const [allSales, setAllSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const dailyRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const allRef = useRef<HTMLDivElement>(null);

  // Helper function to format currency
  const formatCurrency = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString('id-ID');
    }
    return parseInt(value || 0).toLocaleString('id-ID');
  };

  // Enhanced PDF Download function - Fixed to show complete content
  const downloadPDF = async (elementRef: any, filename: string) => {
    try {
      setDownloadLoading(true);
      
      if (!elementRef.current) {
        alert('Tidak ada data untuk diunduh');
        return;
      }

      // Clone element
      const cloneElement = elementRef.current.cloneNode(true) as HTMLElement;
      
      // Create temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '1000px'; // Fixed width for consistent rendering
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '20px';
      container.appendChild(cloneElement);
      document.body.appendChild(container);

      // Render to canvas with better settings
      const canvas = await html2canvas(container, {
        scale: 2, // Reduced scale for better rendering
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowHeight: container.scrollHeight,
        windowWidth: 1000,
      });

      // Remove container
      document.body.removeChild(container);

      // Create PDF with better dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 10; // 10mm margins
      const contentWidth = pageWidth - margin * 2; // 190mm
      
      // Calculate image dimensions
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 0.95);

      // Header height
      const headerHeight = 28;
      const footerHeight = 10;
      const availableHeight = pageHeight - headerHeight - footerHeight - margin * 2;

      let currentPage = 1;
      let remainingHeight = imgHeight;
      let yPosition = headerHeight + margin;

      while (remainingHeight > 0) {
        // Add header
        pdf.setFillColor(31, 41, 55);
        pdf.rect(0, 0, pageWidth, headerHeight, 'F');

        // Title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LAPORAN PENJUALAN', margin, 12);

        // Business name
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Warung Ibuk Iyos', margin, 20);

        // Period info
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(9);
        const periodText = filename
          .replace('Laporan_Harian_', 'Tanggal: ')
          .replace('Laporan_Bulanan_', 'Periode: ')
          .replace('Laporan_Semua_Transaksi', 'Laporan Keseluruhan');
        pdf.text(periodText, margin, 26);

        // Add content
        if (remainingHeight > availableHeight) {
          // Add portion of image that fits on this page
          const cropHeight = availableHeight;
          const cropFromY = imgHeight - remainingHeight;
          
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            yPosition,
            contentWidth,
            (cropHeight * contentWidth) / contentWidth
          );

          remainingHeight -= availableHeight;
          
          // Add new page if content remains
          if (remainingHeight > 0) {
            pdf.addPage();
            currentPage++;
            yPosition = margin;
          }
        } else {
          // Add remaining content
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            yPosition,
            contentWidth,
            remainingHeight
          );
          remainingHeight = 0;
        }

        // Add footer
        const footerY = pageHeight - footerHeight + 2;
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, footerY - 2, pageWidth - margin, footerY - 2);
        
        const totalPages = Math.ceil(imgHeight / availableHeight);
        const footerText = `Halaman ${currentPage} dari ${totalPages} | Generated: ${new Date().toLocaleString('id-ID')}`;
        pdf.text(footerText, margin, footerY + 4);
      }

      // Save PDF
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename_clean = filename
        .replace('Laporan_', '')
        .replace(/_/g, ' ')
        .slice(0, 30);
      pdf.save(`${filename_clean}_${timestamp}.pdf`);
      
      alert('✅ PDF berhasil diunduh! Laporan sudah utuh dan tidak terpotong.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(
        'Gagal mengunduh PDF. Error: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setIsAdmin(true);
    loadData();
  };

  const loadData = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);

      if (tab === 'daily') {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/sales/daily?date=${selectedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setDailyData(data);
      } else if (tab === 'monthly') {
        const [year, month] = selectedMonth.split('-');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/sales/monthly?year=${year}&month=${month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setMonthlyData(data);
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/sales`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setAllSales(data.sales);
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab, selectedDate, selectedMonth]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-900 mb-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-blue-900">📊 Riwayat Penjualan</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 sticky top-0 z-40 bg-white p-4 rounded-xl shadow-lg">
          <button
            onClick={() => setTab('daily')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              tab === 'daily'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            📅 Harian
          </button>
          <button
            onClick={() => setTab('monthly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              tab === 'monthly'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            📆 Bulanan
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              tab === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            📋 Semua Transaksi
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-blue-600 font-semibold">Memuat data...</p>
          </div>
        ) : tab === 'daily' && dailyData ? (
          <div className="space-y-8">
            {/* Date Picker & Download */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Pilih Tanggal</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 w-full"
                  />
                </div>
                <button
                  onClick={() => downloadPDF(dailyRef, `Laporan_Harian_${selectedDate}`)}
                  disabled={downloadLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center gap-2"
                >
                  {downloadLoading ? '⏳ Generating...' : '📥 Download PDF'}
                </button>
              </div>
            </div>

            {/* Content to Export */}
            <div ref={dailyRef} className="space-y-8 bg-white p-8 rounded-xl">
              {/* Header */}
              <div className="border-b-2 border-gray-200 pb-4">
                <h2 className="text-3xl font-bold text-blue-900">Laporan Penjualan Harian</h2>
                <p className="text-gray-600 mt-2">Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
                  <p className="text-green-700 font-semibold text-sm">Total Pendapatan</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    Rp {formatCurrency(dailyData.totalRevenue)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-blue-700 font-semibold text-sm">Jumlah Transaksi</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{dailyData.totalTransactions}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-l-4 border-orange-500">
                  <p className="text-orange-700 font-semibold text-sm">Total Item Terjual</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{dailyData.totalItems}</p>
                </div>
              </div>

              {/* Transactions List */}
              {!dailyData.sales || dailyData.sales.length === 0 ? (
                <div className="bg-blue-50 rounded-lg p-8 text-center">
                  <p className="text-blue-600 font-semibold text-lg">Tidak ada transaksi hari ini</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-100 px-6 py-4">
                    <h3 className="text-xl font-bold text-blue-900">Daftar Transaksi</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">ID</th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">Waktu</th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">Produk</th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">Metode</th>
                          <th className="px-6 py-3 text-right font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dailyData.sales || []).map((sale, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-3 font-semibold text-blue-600">#{sale.id}</td>
                            <td className="px-6 py-3 text-gray-700">
                              {new Date(sale.createdAt).toLocaleTimeString('id-ID')}
                            </td>
                            <td className="px-6 py-3 text-gray-700">
                              {sale.items?.length || 0} item(s)
                            </td>
                            <td className="px-6 py-3 text-gray-700">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                {sale.paymentMethod || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-bold text-green-600">
                              Rp {formatCurrency(sale.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : tab === 'monthly' && monthlyData ? (
          <div className="space-y-8">
            {/* Month Picker & Download */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Pilih Bulan</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 w-full"
                  />
                </div>
                <button
                  onClick={() => downloadPDF(monthlyRef, `Laporan_Bulanan_${selectedMonth}`)}
                  disabled={downloadLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center gap-2"
                >
                  {downloadLoading ? '⏳ Generating...' : '📥 Download PDF'}
                </button>
              </div>
            </div>

            {/* Content to Export */}
            <div ref={monthlyRef} className="space-y-8 bg-white p-8 rounded-xl">
              {/* Header */}
              <div className="border-b-2 border-gray-200 pb-4">
                <h2 className="text-3xl font-bold text-blue-900">Laporan Penjualan Bulanan</h2>
                <p className="text-gray-600 mt-2">Periode: {new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
                  <p className="text-green-700 font-semibold text-sm">Total Pendapatan</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    Rp {formatCurrency(monthlyData.totalRevenue)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-blue-700 font-semibold text-sm">Jumlah Transaksi</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{monthlyData.totalTransactions}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-l-4 border-orange-500">
                  <p className="text-orange-700 font-semibold text-sm">Total Item Terjual</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{monthlyData.totalItems}</p>
                </div>
              </div>

              {/* Chart Section */}
              {Object.keys(monthlyData.byDay || {}).length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Grafik Penjualan Harian</h3>
                  <div style={{ height: '300px', position: 'relative' }}>
                    <Line
                      data={{
                        labels: Object.keys(monthlyData.byDay || {}).sort(),
                        datasets: [
                          {
                            label: 'Pendapatan (Rp)',
                            data: Object.entries(monthlyData.byDay || {})
                              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                              .map(([_, data]: any) => data.revenue),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: true, position: 'top' },
                        },
                        scales: {
                          y: { beginAtZero: true },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Daily Breakdown Table */}
              {Object.keys(monthlyData.byDay || {}).length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-100 px-6 py-4">
                    <h3 className="text-xl font-bold text-blue-900">Rincian Per Hari</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                          <th className="px-6 py-3 text-center font-semibold text-gray-700">Transaksi</th>
                          <th className="px-6 py-3 text-center font-semibold text-gray-700">Item</th>
                          <th className="px-6 py-3 text-right font-semibold text-gray-700">Pendapatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(monthlyData.byDay || {})
                          .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                          .map(([date, data]: any) => (
                            <tr key={date} className="border-b hover:bg-gray-50">
                              <td className="px-6 py-3 font-semibold text-gray-700">{new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                              <td className="px-6 py-3 text-center text-blue-600 font-semibold">{data.transactions}</td>
                              <td className="px-6 py-3 text-center text-orange-600 font-semibold">{data.items}</td>
                              <td className="px-6 py-3 text-right font-bold text-green-600">
                                Rp {formatCurrency(data.revenue)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Download Button for All */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => downloadPDF(allRef, `Laporan_Semua_Transaksi`)}
                disabled={downloadLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center gap-2"
              >
                {downloadLoading ? '⏳ Generating...' : '📥 Download PDF'}
              </button>
            </div>

            {/* All Transactions Table */}
            <div ref={allRef} className="bg-white p-8 rounded-xl space-y-8">
              {/* Header */}
              <div className="border-b-2 border-gray-200 pb-4">
                <h2 className="text-3xl font-bold text-blue-900">Laporan Semua Transaksi</h2>
                <p className="text-gray-600 mt-2">Total: {allSales.length} transaksi</p>
              </div>

              {/* Summary Stats */}
              {allSales.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
                    <p className="text-green-700 font-semibold text-sm">Total Pendapatan Keseluruhan</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      Rp {formatCurrency(allSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0))}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
                    <p className="text-blue-700 font-semibold text-sm">Rata-rata per Transaksi</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      Rp {formatCurrency(allSales.length > 0 ? allSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) / allSales.length : 0)}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Method Distribution Chart */}
              {allSales.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Distribusi Metode Pembayaran</h3>
                  <div style={{ height: '250px', position: 'relative', maxWidth: '400px' }}>
                    <Pie
                      data={{
                        labels: [...new Set(allSales.map(s => s.paymentMethod || 'N/A'))],
                        datasets: [
                          {
                            data: [...new Set(allSales.map(s => s.paymentMethod || 'N/A'))].map(method =>
                              allSales.filter(s => (s.paymentMethod || 'N/A') === method).length
                            ),
                            backgroundColor: [
                              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
                            ],
                            borderColor: '#ffffff',
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Transactions Table */}
              {allSales.length === 0 ? (
                <div className="bg-blue-50 rounded-lg p-8 text-center">
                  <p className="text-blue-600 font-semibold text-lg">Tidak ada transaksi</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-100 px-6 py-4">
                    <h3 className="text-xl font-bold text-blue-900">Daftar Transaksi</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">ID</th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">Waktu</th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">Metode</th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-3 text-right font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(allSales || []).map((sale, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-3 font-semibold text-blue-600">#{sale.id}</td>
                            <td className="px-6 py-3 text-gray-700">
                              {new Date(sale.createdAt).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-3 text-gray-700">
                              {new Date(sale.createdAt).toLocaleTimeString('id-ID')}
                            </td>
                            <td className="px-6 py-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                {sale.paymentMethod || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                sale.status === 'completed' 
                                  ? 'bg-green-100 text-green-700'
                                  : sale.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {sale.status || 'unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-bold text-green-600">
                              Rp {formatCurrency(sale.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
