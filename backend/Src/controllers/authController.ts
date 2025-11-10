import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { LoginRequest, AuthResponse } from '../types';
const JWT_SECRET = process.env.JWT_SECRET || 'warung-ibuk-iyos-secret-key';

export const login = async (req: Request, res: Response) =>{


  try {

  }
}
