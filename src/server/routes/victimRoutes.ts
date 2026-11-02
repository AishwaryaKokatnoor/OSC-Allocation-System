import { Router } from 'express';
import { VictimController } from '../controllers';

const router = Router();

// Screen 2: Emergency Request Submission
router.post('/emergency-request', VictimController.submitEmergencyRequest);

// Screen 3: General Assistance Request Intake
router.post('/requests', VictimController.submitAssistanceRequest);

// Screen 4: OSC Discovery & Directory Filters
router.get('/oscs/filters', VictimController.getOSCFilters);
router.get('/oscs', VictimController.getOSCs);

// Screen 5: Recommended Support with Transparent Weighted Scoring
router.get('/requests/:id/recommendations', VictimController.getRecommendations);

// Screen 5 -> Screen 6: Select OSC & Create Official Referral Record
router.post('/requests/:id/referral', VictimController.createReferral);

// Screen 6: Request Tracking Timeline & Status
router.get('/requests/:reference', VictimController.getRequestStatus);
router.post('/requests/:reference/cancel', VictimController.cancelRequest);

// Screen 7: In-App Messaging & Callback Requests
router.get('/communications/:reference', VictimController.getMessages);
router.post('/communications/:reference', VictimController.sendMessage);

// Screen 8: Victim Notifications
router.get('/notifications/:reference', VictimController.getNotifications);
router.post('/notifications/:reference/read-all', VictimController.markAllNotificationsRead);

// Screen 9: Data Deletion Request Workflow
router.post('/privacy/data-deletion', VictimController.requestDataDeletion);

export default router;
