import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { Sale, SaleRequest } from '../types';

export const createSale = async (req: Request, res: Response) => {
     try {
    const { items, cashier }: SaleRequest = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }
let total = 0;
    const saleItems = [];

for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

       if (!product) {
        return res.status(404).json({ error: `Product with id ${item.productId} not found` });
}
     }

     if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
    }
     const itemTotal = product.price * item.quantity;
      total += itemTotal;

}