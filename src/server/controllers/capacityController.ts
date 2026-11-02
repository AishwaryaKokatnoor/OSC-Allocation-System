import { Request, Response } from 'express';
import { CapacityRepository, NotificationRepository } from '../db/repository';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcastCapacityChange, broadcastNotification } from '../socket';

export class CapacityController {
  /**
   * GET /api/capacity
   * Get current verified shelter capacity
   */
  static async getCapacity(_req: Request, res: Response) {
    try {
      const cap = await CapacityRepository.getByOSC('osc-ka-blr-01');
      return res.json(cap);
    } catch (err: any) {
      console.error('[CapacityController.getCapacity] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/capacity/update
   * Atomically adjust shelter capacity, check constraints, log to audit trail, and emit WebSocket
   */
  static async updateCapacity(req: AuthenticatedRequest, res: Response) {
    try {
      const { action, delta = 1 } = req.body;
      if (!['admission', 'discharge', 'maintenance'].includes(action)) {
        return res.status(400).json({ error: 'Action must be admission, discharge, or maintenance.' });
      }

      const changedBy = req.user?.name || 'Authorized Staff';
      const result = await CapacityRepository.updateCapacity('osc-ka-blr-01', action, delta, changedBy);

      // Real-Time Socket Broadcast
      broadcastCapacityChange('osc-ka-blr-01', result.capacity);

      // High Occupancy Alert (> 85%)
      if (result.capacity.occupancyRate >= 85) {
        const alertNotif = await NotificationRepository.create({
          recipientType: 'centre',
          recipientId: 'osc-ka-blr-01',
          title: 'Shelter Capacity Alert',
          message: `High occupancy warning: Shelter is at ${result.capacity.occupancyRate}% (${result.capacity.availableBeds} beds remaining).`,
          type: 'capacity_alert'
        });
        broadcastNotification('osc-ka-blr-01', alertNotif);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[CapacityController.updateCapacity] Error:', err);
      return res.status(400).json({ error: err.message });
    }
  }

  /**
   * GET /api/capacity/logs
   * Fetch immutable audit logs of shelter capacity changes
   */
  static async getLogs(_req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await CapacityRepository.getLogs('osc-ka-blr-01');
      return res.json(logs);
    } catch (err: any) {
      console.error('[CapacityController.getLogs] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
