import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { authenticate } from '../middleware/auth';
import {
  UserRegisterSchema,
  UserLoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RoleSelectionSchema,
} from '@vflow/shared';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = UserRegisterSchema.parse(req.body);
    const result = await AuthService.register(validated);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = UserLoginSchema.parse(req.body);
    const result = await AuthService.login(validated.email, validated.password);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = ForgotPasswordSchema.parse(req.body);
    const result = await AuthService.forgotPassword(validated.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = ResetPasswordSchema.parse(req.body);
    const result = await AuthService.resetPassword(validated.token, validated.newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.verifyEmail(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/role-selection', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = RoleSelectionSchema.parse(req.body);
    const result = await AuthService.selectRole(req.user!.id, validated.role);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const profile = await AuthService.getProfile(req.user.id);
    res.json({ success: true, user: profile });
  } catch (err) {
    next(err);
  }
});

export default router;
