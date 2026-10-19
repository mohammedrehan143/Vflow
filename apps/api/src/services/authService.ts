import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUserDocument } from '../models/User';
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

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await UserModel.create({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role || 'customer'
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone
      },
      token
    };
  }

  static async login(email: string, password: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
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
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone
      },
      token
    };
  }

  static async getProfile(userId: string) {
    const user = await UserModel.findById(userId).select('-passwordHash');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateVehicles(
    userId: string,
    vehicles: Array<{ licensePlate: string; model: string; type: any; isDefault?: boolean }>
  ) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { vehicles } },
      { new: true }
    ).select('-passwordHash');
    return user;
  }

  private static generateToken(user: IUserDocument): string {
    return jwt.sign(
      {
        id: user._id.toString(),
        sub: user._id.toString(),
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );
  }
}
