import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'warung-ibuk-iyos-secret-key';
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
     const authHeader = req.headers['authorization'];












}

