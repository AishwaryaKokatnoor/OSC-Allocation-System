import { Response } from 'express';
import { NotificationRepository } from '../db/repository';
import { AuthenticatedRequest } from '../middleware/auth';

export class NotificationController {
  /**
   * GET /api/notifications
   * Retrieve centre notifications for staff
   */
  static async getCentreNotifications(_req: AuthenticatedRequest, res: Response) {
    try {
      const notifs = await NotificationRepository.getForRecipient('osc-ka-blr-01');
      return res.json(notifs);
    } catch (err: any) {
      console.error('[NotificationController.getCentreNotifications] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/notifications/read-all
   * Mark all centre notifications as read
   */
  static async markAllCentreRead(_req: AuthenticatedRequest, res: Response) {
    try {
      await NotificationRepository.markAllRead('osc-ka-blr-01');
      return res.json({ message: 'All notifications marked as read.' });
    } catch (err: any) {
      console.error('[NotificationController.markAllCentreRead] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
