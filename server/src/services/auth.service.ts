import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/user.model.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { AppError } from '../utils/AppError.js';

export interface AuthResult {
  user: IUser;
  token: string;
}

export class AuthService {
  private static generateToken(user: IUser): string {
    const secret: Secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    return jwt.sign({ id: user._id.toString(), email: user.email }, secret, { expiresIn });
  }

  static async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  static async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
