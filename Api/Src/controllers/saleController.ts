// src/controllers/saleController.ts

import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { Sale, SaleRequest } from '../types';

export const createSale = async (req: Request, res: Response) => {
  try {
    const { items, cashier }: SaleRequest = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: 'Items array is required and cannot be empty' });
    }

    if (!cashier) {
      return res.status(400).json({ error: 'Cashier is required' });
    }

    let total = 0;
    const saleItems: { productId: number; quantity: number; price: number }[] =
      [];

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive integer' });
      }
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Product with id ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: product.stock - item.quantity,
        },
      });
    }

    const sale = (await prisma.sale.create({
      data: {
        total,
        cashier,
        items: {
          create: saleItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })) as unknown as Sale;

    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid startDate or endDate' });
      }
      where.date = {
        gte: start,
        lte: end,
      };
    }

    const sales: Sale[] = (await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })) as unknown as Sale[];

    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};
