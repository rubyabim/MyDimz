// src/controllers/productController.ts

import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import {
  Product,
  ProductRequest,
  PublicProductsResponse,
  Category,
} from '../types';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

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

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
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

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
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
    }: ProductRequest = req.body;

    if (!name || price == null || stock == null || !category) {
      return res
        .status(400)
        .json({ error: 'Name, price, stock, and category are required' });
    }

    const product: Product = (await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        description,
        barcode,
      },
    })) as unknown as Product;

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
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
    }: ProductRequest = req.body;

    const product: Product = (await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        description,
        barcode,
      },
    })) as unknown as Product;

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id, 10) },
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
