import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../utils/database';
import { Sale } from '../types';

export const generateDailyReport = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const startDate = new Date(date as string);
    const endDate = new Date(date as string);
    endDate.setDate(endDate.getDate() + 1);

    const sales = await prisma.sale.findMany({
      where: {
        date: {
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
    });
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
     res.setHeader('Content-Disposition', `attachment; filename="laporan-harian-${date}.pdf"`);

      doc.pipe(res);

      doc.fontSize(20).text('WARUNG IBUK IYOS', 100, 100);
      doc.fontSize(16).text('Laporan Harian Penjualan', 100, 130);
       doc.fontSize(12).text(`Tanggal: ${date}`, 100, 160);
        doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 100, 180);

         let y = 220;

          doc.fontSize(14).text('Ringkasan Penjualan:', 100, y);
           y += 30;

           const totalSales = sales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
            const totalItems = sales.reduce((sum: number, sale: Sale) => 
                 sum + sale.items.reduce((itemSum: number, item) => itemSum + item.quantity, 0), 0
    );

    doc.text(`Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}`, 120, y);
y += 20;

doc.text(`Total Transaksi: ${sales.length}`, 120, y);
y += 20;

    doc.text(`Total Item Terjual: ${totalItems}`, 120, y);
y += 40;

 if (sales.length > 0) {
      doc.fontSize(14).text('Detail Transaksi:', 100, y);
      y += 30;

       sales.forEach((sale: Sale, index: number) => {
        if (y > 700) {
           doc.addPage();
          y = 100;
        }

        doc.fontSize(10).text(`Transaksi #${index + 1} - ${sale.date.toLocaleString('id-ID')}`, 120, y);

         y += 15;
        doc.text(`Kasir: ${sale.cashier}`, 120, y);

         y += 15;
        doc.text(`Total: Rp ${sale.total.toLocaleString('id-ID')}`, 120, y);
        y += 10;

         sale.items.forEach((item) => {
          doc.text(`  ${item.product.name} - ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}`, 140, y);

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
      return res.status(400).json({ error: 'Year and month parameters are required' });
    }

     const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
     const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      
     const sales = await prisma.sale.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },

        },
      include: {
         items: {

    