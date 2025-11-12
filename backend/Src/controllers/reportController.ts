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


}
