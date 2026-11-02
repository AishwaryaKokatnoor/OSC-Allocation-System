import { Response } from 'express';
import { UserRepository } from '../db/repository';
import { AuthenticatedRequest } from '../middleware/auth';

export class StaffController {
  /**
   * GET /api/staff
   * List staff members assigned to the centre
   */
  static async getStaff(_req: AuthenticatedRequest, res: Response) {
    try {
      const staff = await UserRepository.getAllByOSC('osc-ka-blr-01');
      return res.json(staff);
    } catch (err: any) {
      console.error('[StaffController.getStaff] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/staff
   * Add new staff member (Restricted to OSC Centre Administrators)
   */
  static async createStaff(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, role, phone, badgeId } = req.body;
      const created = await UserRepository.create({
        name,
        email,
        passwordHash: '$2b$10$eX4mPl3...',
        role: role || 'case_manager',
        oscId: 'osc-ka-blr-01',
        phone,
        badgeId,
        active: true
      });
      return res.status(201).json(created);
    } catch (err: any) {
      console.error('[StaffController.createStaff] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
