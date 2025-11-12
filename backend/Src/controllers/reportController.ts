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
         gte: startDate
      },


}
   ) }