import { Response } from 'express';
import { ReferralRepository, NotificationRepository } from '../db/repository';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcastReferralUpdate, broadcastNotification } from '../socket';

export class ReferralController {
  /**
   * GET /api/referrals
   * Retrieve all pending and historical referrals for this centre
   */
  static async getReferrals(_req: AuthenticatedRequest, res: Response) {
    try {
      const referrals = await ReferralRepository.getAll('osc-ka-blr-01');
      return res.json(referrals);
    } catch (err: any) {
      console.error('[ReferralController.getReferrals] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /api/referrals/:id/status
   * Accept, reject, or update status of a victim referral
   */
  static async updateReferralStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, rejectionReason, notes } = req.body;
      const ref = await ReferralRepository.updateStatus(req.params.id, status, {
        rejectionReason,
        notes,
        assignedStaffName: req.user?.name
      });

      if (!ref) {
        return res.status(404).json({ error: 'Referral record not found.' });
      }

      // Broadcast update to all staff connected via Socket.IO
      broadcastReferralUpdate(ref.oscId, ref);

      // Create notification for the victim's channel
      const notif = await NotificationRepository.create({
        recipientType: 'victim',
        recipientId: ref.requestReference,
        title: `Referral Status Updated: ${status}`,
        message: status === 'Accepted'
          ? `Your assistance request referral (${ref.referralCode}) has been Accepted by the One Stop Centre.`
          : status === 'Rejected'
          ? `Referral review completed. Reason: ${rejectionReason || 'Referred to alternate facility'}.`
          : `Referral status is now: ${status}.`,
        type: 'referral_status',
        referenceId: ref.referralCode
      });
      broadcastNotification(ref.requestReference, notif);

      return res.json(ref);
    } catch (err: any) {
      console.error('[ReferralController.updateReferralStatus] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
