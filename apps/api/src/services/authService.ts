import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel, IUserDocument } from '../models/User';
import { ProviderModel } from '../models/Provider';
import { getSupabaseClient } from '../config/supabase';
import { UserRole } from '@vflow/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'vflow_super_secure_jwt_dev_secret_key_change_in_production_32chars!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
  }) {
    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    let supabaseId: string | undefined;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: supaUser, error } = await supabase.auth.signUp({
          email: data.email.toLowerCase(),
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone,
            },
          },
        });
        if (!error && supaUser.user) {
          supabaseId = supaUser.user.id;
        }
      } catch (err) {
        console.warn('[Supabase Auth] Fallback to MongoDB auth:', err);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await UserModel.create({
      supabaseId,
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role || 'customer',
      emailVerified: false,
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        supabaseId: user.supabaseId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  static async login(email: string, password: string) {
    let user = await UserModel.findOne({ email: email.toLowerCase() });

    // Optional Supabase Auth validation
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: supaAuth, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });

        if (!error && supaAuth.user) {
          if (!user) {
            user = await UserModel.create({
              supabaseId: supaAuth.user.id,
              email: supaAuth.user.email || email.toLowerCase(),
              fullName: supaAuth.user.user_metadata?.full_name || 'VFlow Driver',
              role: 'customer',
              emailVerified: true,
            });
          } else if (!user.supabaseId) {
            user.supabaseId = supaAuth.user.id;
            await user.save();
          }
        }
      } catch (err) {
        console.warn('[Supabase Auth] Fallback to local auth check');
      }
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        supabaseId: user.supabaseId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if not found to prevent user enumeration
      return { success: true, message: 'If an account exists, a password reset link has been dispatched.' };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
        });
      } catch (err) {
        console.warn('[Supabase Auth] Reset email error, using fallback');
      }
    }

    // Generate local token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return {
      success: true,
      message: 'Password reset link dispatched.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Password reset token is invalid or has expired.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true };
  }

  static async verifyEmail(email: string): Promise<{ success: boolean }> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error('User not found');
    user.emailVerified = true;
    await user.save();
    return { success: true };
  }

  static async selectRole(userId: string, role: 'customer' | 'provider') {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    user.role = role;
    await user.save();

    // If selecting provider, ensure canonical provider record initialized
    if (role === 'provider') {
      let provider = await ProviderModel.findOne({ authUserId: user._id.toString() });
      if (!provider) {
        provider = await ProviderModel.create({
          authUserId: user._id.toString(),
          displayName: user.fullName,
          email: user.email,
          phone: user.phone || '+91 98888 22222',
          providerType: 'individual',
          serviceAreas: ['Bangalore'],
          serviceTypes: ['parking', 'charging'],
          verificationStatus: 'unverified',
          address: {
            street: 'Main Road',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
          },
        });
      }
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user._id.toString(),
        supabaseId: user.supabaseId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  static async getProfile(userId: string) {
    const user = await UserModel.findById(userId).select('-passwordHash');
    if (!user) throw new Error('User not found');
    return user;
  }

  private static generateToken(user: IUserDocument): string {
    return jwt.sign(
      {
        id: user._id.toString(),
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );
  }
}
