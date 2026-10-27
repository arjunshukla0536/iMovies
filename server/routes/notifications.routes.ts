import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// GET all notifications for the authenticated user
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  const userId = req.user!.id;
  const userNotifications = db.notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifications.filter(n => !n.read).length;

  res.json({
    notifications: userNotifications,
    unreadCount,
  });
});

// Mark single notification as read
router.post('/:id/read', authMiddleware, (req: AuthRequest, res: Response): void => {
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.user!.id);
  if (!notif) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  notif.read = true;
  res.json({ notification: notif });
});

// Mark all as read
router.post('/read-all', authMiddleware, (req: AuthRequest, res: Response): void => {
  const userId = req.user!.id;
  for (const notif of db.notifications) {
    if (notif.userId === userId) {
      notif.read = true;
    }
  }
  res.json({ message: 'All notifications marked as read.' });
});

export default router;
