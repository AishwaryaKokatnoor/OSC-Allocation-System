import { Request, Response } from 'express';
import { ServiceRepository } from '../db/repository';
import { AuthenticatedRequest } from '../middleware/auth';

export class ServiceController {
  /**
   * GET /api/services
   * List all specialized services offered by the OSC
   */
  static async getServices(_req: Request, res: Response) {
    try {
      const services = await ServiceRepository.getByOSC('osc-ka-blr-01');
      return res.json(services);
    } catch (err: any) {
      console.error('[ServiceController.getServices] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /api/services/:id
   * Update availability status or operational notes for an OSC service
   */
  static async updateService(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, additionalNotes } = req.body;
      const updatedBy = req.user?.name || 'Staff Member';
      const service = await ServiceRepository.updateStatus(req.params.id, status, updatedBy, additionalNotes);
      return res.json(service);
    } catch (err: any) {
      console.error('[ServiceController.updateService] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
