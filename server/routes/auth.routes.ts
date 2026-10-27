import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authMiddleware, AuthRequest } from '../auth.js';
import { User } from '../../src/types/index.js';

const router = Router();

// Register new user
router.post('/register', (req: Request, res: Response): void => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: normalizedEmail,
    role: role === 'admin' ? 'admin' : 'user',
    phone: phone || '',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.passwords.set(newUser.id, hashedPassword);

  // Send welcome notification
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: newUser.id,
    title: 'Welcome to IMovies!',
    message: 'Explore blockbuster premieres, book IMAX luxury seats, and enjoy cinematic excellence.',
    type: 'system',
    read: false,
    createdAt: new Date().toISOString(),
  });

  const token = generateToken(newUser);
  res.status(201).json({ user: newUser, token });
});

// Login
router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Please provide both email and password.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const hashedPassword = db.passwords.get(user.id);
  if (!hashedPassword || !bcrypt.compareSync(password, hashedPassword)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = generateToken(user);
  res.json({ user, token });
});

// Get current user profile
router.get('/me', authMiddleware, (req: AuthRequest, res: Response): void => {
  res.json({ user: req.user });
});

// Demo accounts for instant 1-click evaluation
router.get('/demo-accounts', (_req: Request, res: Response): void => {
  res.json({
    admin: { email: 'admin@imovies.cinema', password: 'Admin@123', label: 'Cinema Administrator' },
    user: { email: 'alex@cinephile.com', password: 'User@123', label: 'Standard Customer' },
  });
});

export default router;
