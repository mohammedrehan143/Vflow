import { Router } from 'express';
import { AuthService } from '../services/authService';
import { authenticate } from '../middleware/auth';
import { UserRegisterSchema, UserLoginSchema } from '@vflow/shared';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const validated = UserRegisterSchema.parse(req.body);
    const result = await AuthService.register(validated);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const validated = UserLoginSchema.parse(req.body);
    const result = await AuthService.login(validated.email, validated.password);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
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

router.put('/vehicles', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const user = await AuthService.updateVehicles(req.user.id, req.body.vehicles || []);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

export default router;
