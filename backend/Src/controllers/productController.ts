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

export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    let where: any = {};
    
    if (category && category !== 'all') {
      where.category = category as string;
    }
    
    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive' as any
      };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const response: PublicProductsResponse = {
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1
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
      where: { id: parseInt(id) }
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
        id: true
      }
    });

    const response: Category[] = categories.map(cat => ({
      name: cat.category,
      count: cat._count.id
    }));

    res.json(response);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, category, description, barcode }: ProductRequest = req.body;

    if (!name || !price || !stock || !category) {
      return res.status(400).json({ error: 'Name, price, stock, and category are required' });
    }

    const product: Product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price.toString()),
        stock: parseInt(stock.toString()),
        category,
        description,
        barcode
      }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category, description, barcode }: ProductRequest = req.body;

    const product: Product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseInt(price.toString()),
        stock: parseInt(stock.toString()),
        category,
        description,
        barcode
      }
    });
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
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};