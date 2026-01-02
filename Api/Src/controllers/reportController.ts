// src/controllers/reportController.ts

import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../utils/database';
import { Sale } from '../types';
// Optional chart rendering using chartjs-node-canvas. This is an optional dependency
// that requires native 'canvas' support. If not installed, the controller will
// skip embedding charts and still generate the PDF reports.
let ChartJSNodeCanvas: any = null;
let QuickChart: any = null;
try {
  // Use require here so TypeScript build doesn't fail if module is absent
  // (developers can install it to enable chart rendering)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ChartJSNodeCanvas = require('chartjs-node-canvas').ChartJSNodeCanvas;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('chart.js/auto');
} catch (e) {
  ChartJSNodeCanvas = null;
}
try {
  // Use QuickChart as a non-native fallback (uses quickchart.io)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  QuickChart = require('quickchart-js');
} catch (e) {
  QuickChart = null;
}

export const generateDailyReport = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const startDate = new Date(date as string);
    const endDate = new Date(date as string);
    endDate.setDate(endDate.getDate() + 1);

    const sales = (await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })) as unknown as Sale[];

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="laporan-harian-${date}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(20).text('WARUNG IBUK IYOS', 100, 100);
    doc.fontSize(16).text('Laporan Harian Penjualan', 100, 130);
    doc.fontSize(12).text(`Tanggal: ${date}`, 100, 160);
    doc
      .fontSize(12)
      .text(
        `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`,
        100,
        180
      );

    let y = 220;

    doc.fontSize(14).text('Ringkasan Penjualan:', 100, y);
    y += 30;

    const totalSales = sales.reduce(
      (sum: number, sale: Sale) => sum + sale.totalAmount,
      0
    );
    const totalItems = sales.reduce(
      (sum: number, sale: Sale) =>
        sum +
        sale.items.reduce(
          (itemSum: number, item) => itemSum + item.quantity,
          0
        ),
      0
    );

    doc.text(`Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}`, 120, y);
    y += 20;
    doc.text(`Total Transaksi: ${sales.length}`, 120, y);
    y += 20;
    doc.text(`Total Item Terjual: ${totalItems}`, 120, y);
    y += 40;

    // Generate hourly sales chart (00 - 23)
    const hourly: number[] = Array.from({ length: 24 }, () => 0);
    sales.forEach((s) => {
      const hr = new Date(s.createdAt).getHours();
      hourly[hr] = (hourly[hr] || 0) + s.totalAmount;
    });

    const chartCallback = (ChartJS: any) => {
      // optional customizations such as plugins can be added here
    };
    const chartNode = ChartJSNodeCanvas ? new ChartJSNodeCanvas({ width: 800, height: 250, chartCallback }) : null;
    const hourlyLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const chartConfig = {
      type: 'bar' as const,
      data: {
        labels: hourlyLabels,
        datasets: [
          {
            label: 'Penjualan (Rp)',
            data: hourly,
            backgroundColor: 'rgba(31,122,235,0.7)',
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
        plugins: { legend: { display: false } },
      },
    };
    let chartBuffer: Buffer | null = null;
    if (chartNode) {
      chartBuffer = await chartNode.renderToBuffer(chartConfig);
    } else if (QuickChart) {
      // Use QuickChart.io service to render chart as a fallback
      const qc = new QuickChart();
      qc.setConfig(chartConfig).setWidth(800).setHeight(250);
      // toBinary returns Promise<Buffer>
      chartBuffer = await qc.toBinary();
    }
    try {
      if (chartBuffer) doc.image(chartBuffer, 100, y, { width: 400 });
      else doc.text('(Grafik tidak tersedia — ketergantungan chart tidak terpasang)', 120, y);
    } catch (err) {
      console.warn('Unable to attach chart to PDF', err);
    }
    y += 270;
    y += 40;

    if (sales.length > 0) {
      doc.fontSize(14).text('Detail Transaksi:', 100, y);
      y += 30;

      sales.forEach((sale: Sale, index: number) => {
        if (y > 700) {
          doc.addPage();
          y = 100;
        }

        doc
          .fontSize(10)
          .text(
            `Transaksi #${index + 1} - ${sale.createdAt.toLocaleString('id-ID')}`,
            120,
            y
          );
        y += 15;
        doc.text(`Kasir: ${sale.customerId}`, 120, y);
        y += 15;
        doc.text(`Total: Rp ${sale.totalAmount.toLocaleString('id-ID')}`, 120, y);
        y += 10;

        sale.items.forEach((item) => {
          doc.text(
            `  ${item.product.name} - ${item.quantity} x Rp ${item.unitPrice.toLocaleString(
              'id-ID'
            )}`,
            140,
            y
          );
          y += 12;
        });

        y += 20;
      });
    } else {
      doc.text('Tidak ada transaksi pada tanggal ini', 120, y);
    }

    doc.end();
  } catch (error) {
    console.error('Generate daily report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const generateMonthlyReport = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res
        .status(400)
        .json({ error: 'Year and month parameters are required' });
    }

    const startDate = new Date(
      parseInt(year as string, 10),
      parseInt(month as string, 10) - 1,
      1
    );
    const endDate = new Date(
      parseInt(year as string, 10),
      parseInt(month as string, 10),
      0
    );

    const sales = (await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })) as unknown as Sale[];

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="laporan-bulanan-${year}-${month}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(20).text('WARUNG IBUK IYOS', 100, 100);
    doc.fontSize(16).text('Laporan Bulanan Penjualan', 100, 130);
    doc
      .fontSize(12)
      .text(
        `Periode: ${new Date(
          parseInt(year as string, 10),
          parseInt(month as string, 10) - 1
        ).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
        100,
        160
      );
    doc
      .fontSize(12)
      .text(
        `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`,
        100,
        180
      );

    let y = 220;

    doc.fontSize(14).text('Ringkasan Bulanan:', 100, y);
    y += 30;

    const totalSales = sales.reduce(
      (sum: number, sale: Sale) => sum + sale.totalAmount,
      0
    );
    const totalTransactions = sales.length;
    const dailySales: { [key: string]: number } = {};

    sales.forEach((sale: Sale) => {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      if (!dailySales[dateKey]) {
        dailySales[dateKey] = 0;
      }
      dailySales[dateKey] += sale.totalAmount;
    });

    doc.text(`Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}`, 120, y);
    y += 20;
    doc.text(`Total Transaksi: ${totalTransactions}`, 120, y);
    y += 20;
    doc.text(
      `Rata-rata per Transaksi: Rp ${Math.round(
        totalSales / Math.max(totalTransactions, 1)
      ).toLocaleString('id-ID')}`,
      120,
      y
    );
    y += 40;

    doc.fontSize(14).text('Penjualan Harian (grafik):', 100, y);
    y += 30;

    // Generate daily chart for the month
    const daysInMonth = new Date(parseInt(year as string, 10), parseInt(month as string, 10), 0).getDate();
    const dayLabels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    const dayValues = dayLabels.map((d) => {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return dailySales[dateKey] || 0;
    });

    const chartNode = ChartJSNodeCanvas ? new ChartJSNodeCanvas({ width: 800, height: 250 }) : null;
    const chartConfig = {
      type: 'line' as const,
      data: { labels: dayLabels, datasets: [{ label: 'Penjualan Harian (Rp)', data: dayValues, borderColor: 'rgba(31,122,235,0.9)', backgroundColor: 'rgba(31,122,235,0.2)', fill: true }] },
      options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } },
    };
    let chartBuffer: Buffer | null = null;
    if (chartNode) chartBuffer = await chartNode.renderToBuffer(chartConfig);
    else if (QuickChart) {
      const qc = new QuickChart();
      qc.setConfig(chartConfig).setWidth(800).setHeight(250);
      chartBuffer = await qc.toBinary();
    }
    try { if (chartBuffer) doc.image(chartBuffer, 100, y, { width: 400 }); else doc.text('(Grafik tidak tersedia — ketergantungan chart tidak terpasang)', 120, y); } catch (err) { console.warn('Unable to attach chart to PDF', err); }
    y += 270;

    Object.entries(dailySales).forEach(([dateKey, amount]) => {
      if (y > 700) {
        doc.addPage();
        y = 100;
      }

      const formattedDate = new Date(dateKey).toLocaleDateString('id-ID');
      doc.text(
        `${formattedDate}: Rp ${amount.toLocaleString('id-ID')}`,
        120,
        y
      );
      y += 15;
    });

    doc.end();
  } catch (error) {
    console.error('Generate monthly report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const getDailySalesJson = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter is required' });
    const startDate = new Date(date as string);
    const endDate = new Date(date as string);
    endDate.setDate(endDate.getDate() + 1);
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: startDate, lt: endDate } },
      include: { items: { include: { product: true } } },
    });
    res.json({ date, sales });
  } catch (err) {
    console.error('Get daily sales JSON error:', err);
    res.status(500).json({ error: 'Failed to get daily sales' });
  }
};

export const getMonthlySalesJson = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'Year and month parameters are required' });
    const startDate = new Date(parseInt(year as string, 10), parseInt(month as string, 10) - 1, 1);
    const endDate = new Date(parseInt(year as string, 10), parseInt(month as string, 10), 0);
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { items: { include: { product: true } } },
    });
    // Create daily summary
    const dailySummary: { [dateKey: string]: number } = {};
    for (const s of sales) {
      const dateKey = s.createdAt.toISOString().split('T')[0];
      dailySummary[dateKey] = (dailySummary[dateKey] || 0) + s.totalAmount;
    }
    res.json({ year: parseInt(year as string, 10), month: parseInt(month as string, 10), sales, dailySummary });
  } catch (err) {
    console.error('Get monthly sales JSON error:', err);
    res.status(500).json({ error: 'Failed to get monthly sales' });
  }
};

// Yearly report
export const generateYearlyReport = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: 'Year parameter is required' });
    const yNum = parseInt(year as string, 10);
    const startDate = new Date(yNum, 0, 1);
    const endDate = new Date(yNum, 11, 31, 23, 59, 59);

    const sales = (await prisma.sale.findMany({ where: { createdAt: { gte: startDate, lte: endDate } }, include: { items: { include: { product: true } } } })) as unknown as Sale[];

    const monthlyTotals: number[] = Array.from({ length: 12 }, () => 0);
    sales.forEach((s) => {
      const m = new Date(s.createdAt).getMonth();
      monthlyTotals[m] = (monthlyTotals[m] || 0) + s.totalAmount;
    });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="laporan-tahunan-${year}.pdf"`);
    doc.pipe(res);
    doc.fontSize(20).text('WARUNG IBUK IYOS', 100, 100);
    doc.fontSize(16).text('Laporan Tahunan Penjualan', 100, 130);
    doc.fontSize(12).text(`Tahun: ${year}`, 100, 160);
    doc.fontSize(12).text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 100, 180);
    let yPos = 220;
    doc.fontSize(14).text('Ringkasan Tahunan:', 100, yPos);
    yPos += 30;
    const totalSales = monthlyTotals.reduce((a, b) => a + b, 0);
    doc.text(`Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}`, 120, yPos);
    yPos += 20;

    const monthLabels = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const chartConfig = { type: 'bar' as const, data: { labels: monthLabels, datasets: [{ label: 'Penjualan (Rp)', data: monthlyTotals, backgroundColor: 'rgba(31,122,235,0.7)' }] }, options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } } };
    const chartNode = ChartJSNodeCanvas ? new ChartJSNodeCanvas({ width: 900, height: 320 }) : null;
    let chartBuffer: Buffer | null = null;
    if (chartNode) chartBuffer = await chartNode.renderToBuffer(chartConfig);
    else if (QuickChart) {
      const qc = new QuickChart();
      qc.setConfig(chartConfig).setWidth(900).setHeight(320);
      chartBuffer = await qc.toBinary();
    }
    try { if (chartBuffer) doc.image(chartBuffer, 60, yPos, { width: 480 }); else doc.text('(Grafik tidak tersedia — ketergantungan chart tidak terpasang)', 120, yPos); } catch (err) { console.warn('Unable to attach chart to PDF', err); }
    yPos += 270;
    if (sales.length > 0) {
      doc.fontSize(14).text('Penjualan Per Bulan:', 100, yPos);
      yPos += 30;
      monthlyTotals.forEach((amount, idx) => { doc.text(`${monthLabels[idx]}: Rp ${amount.toLocaleString('id-ID')}`, 120, yPos); yPos += 15; });
    }
    doc.end();
  } catch (err) {
    console.error('Generate yearly report error:', err);
    res.status(500).json({ error: 'Failed to generate yearly report' });
  }
};

export const getYearlySalesJson = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: 'Year parameter is required' });
    const yNum = parseInt(year as string, 10);
    const startDate = new Date(yNum, 0, 1);
    const endDate = new Date(yNum, 11, 31, 23, 59, 59);
    const sales = await prisma.sale.findMany({ where: { createdAt: { gte: startDate, lte: endDate } }, include: { items: { include: { product: true } } } });
    const monthlyTotals: { [month: string]: number } = {};
    sales.forEach((s) => {
      const m = new Date(s.createdAt).getMonth() + 1;
      const key = String(m).padStart(2, '0');
      monthlyTotals[key] = (monthlyTotals[key] || 0) + s.totalAmount;
    });
    res.json({ year: yNum, sales, monthlyTotals });
  } catch (err) {
    console.error('Get yearly sales JSON error:', err);
    res.status(500).json({ error: 'Failed to get yearly sales' });
  }
};
