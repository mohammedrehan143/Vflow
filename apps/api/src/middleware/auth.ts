import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../config/supabase';
import { UserModel } from '../models/User';
import { UserRole } from '@vflow/shared';

export interface AuthUser {
  id: string; // Mongo User ID
  authUserId: string; // Supabase or internal UUID
  email: string;
  role: UserRole;
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Try Supabase verification if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
      if (sbUser && !error) {
        let dbUser = await UserModel.findOne({
          $or: [{ supabaseId: sbUser.id }, { email: sbUser.email }]
        });

        if (!dbUser && sbUser.email) {
          dbUser = await UserModel.create({
            supabaseId: sbUser.id,
            email: sbUser.email,
            fullName: sbUser.user_metadata?.full_name || sbUser.email.split('@')[0],
            role: (sbUser.user_metadata?.role as UserRole) || 'customer'
          });
        }

        if (dbUser) {
          req.user = {
            id: dbUser._id.toString(),
            authUserId: sbUser.id,
            email: dbUser.email,
            role: dbUser.role,
            fullName: dbUser.fullName
          };
          next();
          return;
        }
      }
    }

    // 2. Fallback to native JWT verification
    const secret = process.env.JWT_SECRET || 'vflow_super_secure_jwt_dev_secret_key_change_in_production_32chars!';
    const decoded = jwt.verify(token, secret) as any;

    const dbUser = await UserModel.findById(decoded.id || decoded.sub);
    if (!dbUser || !dbUser.isActive) {
      res.status(401).json({ success: false, error: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: dbUser._id.toString(),
      authUserId: dbUser.supabaseId || dbUser._id.toString(),
      email: dbUser.email,
      role: dbUser.role,
      fullName: dbUser.fullName
    };

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}
