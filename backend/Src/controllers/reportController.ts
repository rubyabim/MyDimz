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