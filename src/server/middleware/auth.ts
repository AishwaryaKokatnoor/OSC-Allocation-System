import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'sakhilink-mwcd-secure-jwt-secret-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'centre_manager' | 'case_manager' | 'counsellor' | 'medical_officer' | 'victim';
  oscId?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function generateToken(payload: TokenPayload, expiresIn: string = '24h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 10);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hash);
}

// Middleware: Authenticate Bearer JWT
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing authentication token.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired authentication token.' });
  }

  req.user = decoded;
  next();
}

// Middleware: Require specific staff roles
export function requireRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Insufficient privileges. Required role: ${allowedRoles.join(' or ')}.` 
      });
    }

    next();
  };
}

// Middleware: Centre Manager check
export const requireManager = requireRoles(['centre_manager']);

// Middleware: Any authorized OSC Staff check
export const requireStaff = requireRoles(['centre_manager', 'case_manager', 'counsellor', 'medical_officer']);
