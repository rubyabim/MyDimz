import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { Product, ProductRequest, PublicProductsResponse, Category } from '../types';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products: Product[] = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};