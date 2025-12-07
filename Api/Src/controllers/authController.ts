// src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { LoginRequest, AuthResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'warung-ibuk-iyos-secret-key';
if (!process.env.JWT_SECRET) {
  // Warn on startup if using default secret, but do not throw error so devs can run locally
  // eslint-disable-next-line no-console
  console.warn('Using default JWT_SECRET. Set process.env.JWT_SECRET in production');
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const initializeAdmin = async (req: Request, res: Response) => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { username: 'admin' },
    });

    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
        },
      });
      res.json({ message: 'Admin user created successfully' });
    } else {
      res.json({ message: 'Admin user already exists' });
    }
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ error: 'Initialization failed' });
  }
};
