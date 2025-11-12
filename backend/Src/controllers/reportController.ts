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
