import { Router } from 'express';
import {
  OSCController,
  CapacityController,
  ServiceController,
  ReferralController,
  CaseController,
  NotificationController,
  ReportController,
  StaffController
} from '../controllers';
import { authenticateToken, requireManager } from '../middleware/auth';

const router = Router();

/* 1. OSC Profile */
router.get('/osc/profile', OSCController.getProfile);
router.put('/osc/profile', authenticateToken, requireManager, OSCController.updateProfile);

/* 2. Shelter Capacity */
router.get('/capacity', CapacityController.getCapacity);
router.post('/capacity/update', authenticateToken, CapacityController.updateCapacity);
router.get('/capacity/logs', authenticateToken, CapacityController.getLogs);

/* 3. Services Management */
router.get('/services', ServiceController.getServices);
router.put('/services/:id', authenticateToken, ServiceController.updateService);

/* 4. Referral Management */
router.get('/referrals', authenticateToken, ReferralController.getReferrals);
router.put('/referrals/:id/status', authenticateToken, ReferralController.updateReferralStatus);

/* 5. Case Coordination */
router.get('/cases', authenticateToken, CaseController.getCases);
router.put('/cases/:id/status', authenticateToken, CaseController.updateCaseStatus);
router.get('/cases/:id/notes', authenticateToken, CaseController.getCaseNotes);
router.post('/cases/:id/notes', authenticateToken, CaseController.addCaseNote);

/* 6. Operational Notifications */
router.get('/notifications', authenticateToken, NotificationController.getCentreNotifications);
router.post('/notifications/read-all', authenticateToken, NotificationController.markAllCentreRead);

/* 7. Reports & Analytics */
router.get('/reports/analytics', authenticateToken, ReportController.getAnalytics);
router.get('/reports/export-csv', authenticateToken, ReportController.exportCSV);

/* 8. Staff Management */
router.get('/staff', authenticateToken, requireManager, StaffController.getStaff);
router.post('/staff', authenticateToken, requireManager, StaffController.createStaff);

export default router;
