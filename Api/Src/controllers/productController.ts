// src/controllers/productController.ts

import { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../utils/database';
import {
  Product,
  ProductRequest,
  PublicProductsResponse,
  Category,
} from '../types';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const where: any = {};
    if (category && category !== 'all') where.category = String(category);
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }
    const rawProducts = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });

    const products: Product[] = rawProducts.map((p) => ({
      ...p,
      image: p.image === null ? undefined : p.image,
      description: p.description === null ? undefined : p.description,
      barcode: p.barcode === null ? undefined : p.barcode,
    }));

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, page = '1', limit = '12' } = req.query;

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category as string;
    }

    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const response: PublicProductsResponse = {
      products: products as Product[],
      total,
      page: pageNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    };

    res.json(response);
  } catch (error) {
    console.error('Get public products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const parsedId = parseInt(id, 10);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ error: 'Product id must be a valid number' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const normalized: Product = {
      ...product,
      image: product.image === null ? undefined : product.image,
      description: product.description === null ? undefined : product.description,
      barcode: product.barcode === null ? undefined : product.barcode,
    };

    res.json(normalized);
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    const response: Category[] = categories.map((cat) => ({
      name: cat.category,
      count: cat._count.id,
    }));

    res.json(response);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      price,
      stock,
      category,
      description,
      barcode,
      image,
    }: ProductRequest = req.body;

    if (!name || price == null || stock == null || !category) {
      return res
        .status(400)
        .json({ error: 'Name, price, stock, and category are required' });
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (Number.isNaN(priceNum) || Number.isNaN(stockNum)) {
      return res.status(400).json({ error: 'Price and stock must be valid numbers' });
    }

    const product: Product = (await prisma.product.create({
      data: {
        name,
        price: priceNum,
        stock: stockNum,
        category,
        description,
        barcode,
        image,
      },
    })) as unknown as Product;

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Create product error:', error);
    // Prisma unique constraint (e.g., barcode unique).
    if ((error as Prisma.PrismaClientKnownRequestError)?.code === 'P2002') {
      return res.status(409).json({ error: 'Unique constraint failed' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      stock,
      category,
      description,
      barcode,
      image,
    }: ProductRequest = req.body;

    const parsedId = parseInt(id, 10);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ error: 'Product id must be a valid number' });
    }

    const priceNum = price !== undefined ? Number(price) : undefined;
    const stockNum = stock !== undefined ? Number(stock) : undefined;
    if ((priceNum !== undefined && Number.isNaN(priceNum)) || (stockNum !== undefined && Number.isNaN(stockNum))) {
      return res.status(400).json({ error: 'Price and stock must be valid numbers' });
    }

    const product: Product = (await prisma.product.update({
      where: { id: parsedId },
      data: {
        name,
        price: priceNum,
        stock: stockNum,
        category,
        description,
        barcode,
        image,
      },
    })) as unknown as Product;

    res.json(product);
  } catch (error: any) {
    console.error('Update product error:', error);
    // Prisma record not found error
    if ((error as any)?.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ error: 'Product id must be a valid number' });
    }

    await prisma.product.delete({
      where: { id: parsedId },
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    if ((error as any)?.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
