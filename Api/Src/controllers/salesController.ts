import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/sales
 * Create new sale (checkout dari cart)
 */
export async function createSale(req: Request, res: Response) {
  try {
    const { customerId, items, paymentMethod, notes } = req.body;

    // Validasi input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items harus berisi minimal 1 produk' });
    }

    // Hitung total
    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ error: `Produk dengan ID ${item.productId} tidak ditemukan` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stok ${product.name} tidak cukup. Tersedia: ${product.stock}, diminta: ${item.quantity}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemTotal,
      });
    }

    // Create sale record
    const sale = await prisma.sale.create({
      data: {
        customerId,
        totalAmount,
        paymentMethod: paymentMethod || 'cash',
        status: 'completed',
        notes,
        items: {
          create: saleItems,
        },
      },
      include: { items: true },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    res.status(201).json({
      message: 'Penjualan berhasil dicatat',
      sale,
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Gagal membuat penjualan' });
  }
}

/**
 * GET /api/sales
 * Get semua sales dengan filter
 */
export async function getSales(req: Request, res: Response) {
  try {
    const { startDate, endDate, status, customerId } = req.query;

    const filters: any = {};

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filters.createdAt.lte = end;
      }
    }

    if (status) filters.status = status;
    if (customerId) filters.customerId = parseInt(customerId as string);

    const sales = await prisma.sale.findMany({
      where: filters,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Gagal mengambil data penjualan' });
  }
}

/**
 * GET /api/sales/:id
 * Get sale detail by ID
 */
export async function getSale(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const saleId = parseInt(id, 10);

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Gagal mengambil detail transaksi' });
  }
}

/**
 * PUT /api/sales/:id
 * Update sale status or notes
 */
export async function updateSale(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const saleId = parseInt(id, 10);

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        status: status || sale.status,
        notes: notes !== undefined ? notes : sale.notes,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    res.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: 'Gagal mengupdate transaksi' });
  }
}

/**
 * DELETE /api/sales/:id
 * Delete sale by ID
 */
export async function deleteSale(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const saleId = parseInt(id, 10);

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    // Delete sale items first
    await prisma.saleItem.deleteMany({
      where: { saleId },
    });

    // Then delete sale
    await prisma.sale.delete({
      where: { id: saleId },
    });

    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Gagal menghapus transaksi' });
  }
}

/**
 * GET /api/sales/daily
 * Get penjualan harian
 */
export async function getDailySales(req: Request, res: Response) {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalTransactions = sales.length;
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((s, i) => s + i.quantity, 0), 0);

    res.json({
      date: targetDate.toISOString().split('T')[0],
      totalRevenue,
      totalTransactions,
      totalItems,
      sales,
    });
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    res.status(500).json({ error: 'Gagal mengambil data penjualan harian' });
  }
}

/**
 * GET /api/sales/monthly
 * Get penjualan bulanan
 */
export async function getMonthlySales(req: Request, res: Response) {
  try {
    const { year, month } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) - 1 : new Date().getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalTransactions = sales.length;
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((s, i) => s + i.quantity, 0), 0);

    // Group by day
    const byDay: any = {};
    sales.forEach((sale) => {
      const day = sale.createdAt.toISOString().split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { revenue: 0, transactions: 0, items: 0 };
      }
      byDay[day].revenue += sale.totalAmount;
      byDay[day].transactions += 1;
      byDay[day].items += sale.items.reduce((s, i) => s + i.quantity, 0);
    });

    res.json({
      period: `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`,
      totalRevenue,
      totalTransactions,
      totalItems,
      byDay,
      sales,
    });
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ error: 'Gagal mengambil data penjualan bulanan' });
  }
}

/**
 * GET /api/sales/stats
 * Get statistik penjualan
 */
export async function getSalesStats(req: Request, res: Response) {
  try {
    const allSales = await prisma.sale.findMany({
      include: { items: true },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySales = allSales.filter((s) => s.createdAt >= todayStart);

    const totalRevenue = allSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalTransactions = allSales.length;
    const todayTransactions = todaySales.length;

    res.json({
      all: {
        revenue: totalRevenue,
        transactions: totalTransactions,
      },
      today: {
        revenue: todayRevenue,
        transactions: todayTransactions,
      },
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik penjualan' });
  }
}

export default router;
