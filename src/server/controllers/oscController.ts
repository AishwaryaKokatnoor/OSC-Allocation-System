import { Request, Response } from 'express';
import { OSCRepository } from '../db/repository';
import { AuthenticatedRequest } from '../middleware/auth';

export class OSCController {
  /**
   * GET /api/osc/profile
   * Retrieve One Stop Centre details
   */
  static async getProfile(_req: Request, res: Response) {
    try {
      const osc = await OSCRepository.getById('osc-ka-blr-01');
      if (!osc) {
        return res.status(404).json({ error: 'OSC profile not found.' });
      }
      return res.json(osc);
    } catch (err: any) {
      console.error('[OSCController.getProfile] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /api/osc/profile
   * Update One Stop Centre configuration and contact info
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await OSCRepository.update('osc-ka-blr-01', req.body);
      return res.json({ message: 'Profile updated successfully.', osc: updated });
    } catch (err: any) {
      console.error('[OSCController.updateProfile] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
