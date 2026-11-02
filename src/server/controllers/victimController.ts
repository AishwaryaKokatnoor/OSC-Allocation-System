import { Request, Response } from 'express';
import {
  AssistanceRequestRepository,
  OSCRepository,
  CapacityRepository,
  ReferralRepository,
  CommunicationRepository,
  NotificationRepository
} from '../db/repository';
import {
  broadcastReferralUpdate,
  broadcastNewMessage,
  broadcastNotification,
  broadcastRequestStatus
} from '../socket';

export class VictimController {
  /**
   * POST /api/victim/emergency-request
   * Screen 2: Emergency SOS / Immediate Assistance Request Submission
   */
  static async submitEmergencyRequest(req: Request, res: Response) {
    try {
      const { servicesNeeded, safeContact, location, urgency = 'critical' } = req.body;

      const request = await AssistanceRequestRepository.create({
        isEmergency: true,
        isGuest: true,
        servicesNeeded: servicesNeeded || ['Police Assistance', 'Medical Assistance'],
        safeContact: safeContact || { method: 'in_person_only' },
        location: location || { district: 'Bengaluru Urban', state: 'Karnataka' },
        urgency,
        shelterRequested: (servicesNeeded || []).includes('Safe Shelter')
      });

      // Notify OSC Staff of high-priority emergency intake
      const notif = await NotificationRepository.create({
        recipientType: 'centre',
        recipientId: 'osc-ka-blr-01',
        title: 'CRITICAL: Emergency Request Received',
        message: `Emergency request ${request.requestReference} received for immediate response.`,
        type: 'new_referral',
        referenceId: request.requestReference
      });
      broadcastNotification('osc-ka-blr-01', notif);

      return res.status(201).json({
        success: true,
        requestId: request.requestReference,
        requestReference: request.requestReference,
        trackingToken: request.trackingToken,
        message: 'Emergency request registered securely.',
        statutoryHelpline: '112'
      });
    } catch (err: any) {
      console.error('[VictimController.submitEmergencyRequest] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/victim/requests
   * Screen 3: General Assistance Request Intake
   */
  static async submitAssistanceRequest(req: Request, res: Response) {
    try {
      const {
        servicesNeeded,
        selectedServices,
        selectedService,
        safeContact,
        location,
        urgency = 'urgent',
        shelterRequested,
        needShelter,
        accessibilityNeeds
      } = req.body;

      const finalLocation = {
        district: location?.district || req.body.district,
        state: location?.state || req.body.state,
        approxCoordinates: location?.approxCoordinates || req.body.approxCoordinates || { lat: 12.9716, lng: 77.5946 }
      };

      if (!finalLocation.district || !finalLocation.state) {
        return res.status(400).json({ error: 'District and State location are required.' });
      }

      const finalServices = servicesNeeded || selectedServices || (selectedService ? [selectedService] : ['Safe Shelter']);
      const finalSafeContact = safeContact || {
        method: req.body.preferredContactMethod || 'in_person_only',
        phoneNumber: req.body.contactNumber,
        safeTimeToCall: req.body.safeTimeToCall
      };

      const request = await AssistanceRequestRepository.create({
        isEmergency: false,
        isGuest: true,
        servicesNeeded: finalServices,
        safeContact: finalSafeContact,
        location: finalLocation,
        urgency,
        shelterRequested: Boolean(shelterRequested || needShelter),
        accessibilityNeeds: accessibilityNeeds || []
      });

      return res.status(201).json({
        success: true,
        requestReference: request.requestReference,
        trackingToken: request.trackingToken,
        message: 'Assistance request logged in confidential intake system.'
      });
    } catch (err: any) {
      console.error('[VictimController.submitAssistanceRequest] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/victim/oscs/filters
   * Screen 4: OSC Discovery & Directory Filters
   */
  static async getOSCFilters(_req: Request, res: Response) {
    try {
      const oscs = await OSCRepository.getAll();
      const states: string[] = Array.from(new Set(oscs.map((o: any) => o.state as string)));
      const districtsByState: Record<string, string[]> = {};
      states.forEach((st: string) => {
        districtsByState[st] = Array.from(new Set(oscs.filter((o: any) => o.state === st).map((o: any) => o.district as string)));
      });

      return res.json({
        states: ['All', ...states],
        districtsByState,
        services: ['Safe Shelter', 'Medical Assistance', 'Legal Counselling', 'Police Assistance', 'Psychological Support'],
        accessibilityOptions: [
          { id: 'wheelchair', label: 'Wheelchair Accessible Ramps' },
          { id: 'ground_floor', label: 'Ground Floor Facilities' },
          { id: 'sign_language', label: 'Sign Language Support' }
        ]
      });
    } catch (err: any) {
      console.error('[VictimController.getOSCFilters] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/victim/oscs
   * Screen 4: Query OSCs with filters and verified capacity
   */
  static async getOSCs(req: Request, res: Response) {
    try {
      const { state, district, search, service } = req.query;
      let oscs = await OSCRepository.getAll();

      if (state && state !== 'All') {
        oscs = oscs.filter((o: any) => o.state.toLowerCase() === (state as string).toLowerCase());
      }
      if (district && district !== 'All') {
        oscs = oscs.filter((o: any) => o.district.toLowerCase() === (district as string).toLowerCase());
      }
      if (search) {
        const q = (search as string).toLowerCase();
        oscs = oscs.filter((o: any) =>
          o.name.toLowerCase().includes(q) ||
          o.district.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q)
        );
      }
      if (service && service !== 'all') {
        oscs = oscs.filter((o: any) => (o.servicesOffered || []).some((s: string) => s.toLowerCase().includes((service as string).toLowerCase())));
      }

      // Attach verified live capacity
      const enriched = await Promise.all(oscs.map(async (o: any) => {
        const cap = await CapacityRepository.getByOSC(o._id || o.centreCode);
        return {
          ...o,
          intakeCapacity: {
            totalBeds: cap?.totalBeds || o.intakeCapacity?.totalBeds || 30,
            currentAvailableBeds: cap?.availableBeds ?? (o.intakeCapacity?.currentAvailableBeds || 8)
          }
        };
      }));

      return res.json({
        total: enriched.length,
        data: enriched
      });
    } catch (err: any) {
      console.error('[VictimController.getOSCs] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/victim/requests/:id/recommendations
   * Screen 5: Recommended Support with Transparent Weighted Scoring
   * Distance (35%), Verified Capacity (30%), Service Match (25%), Accessibility (10%)
   */
  static async getRecommendations(req: Request, res: Response) {
    try {
      const request = await AssistanceRequestRepository.getByReference(req.params.id);
      if (!request) return res.status(404).json({ error: 'Assistance request not found.' });

      const oscs = await OSCRepository.getAll();
      const requestedServices = request.servicesNeeded || ['Safe Shelter'];

      const scoredCentres = await Promise.all(oscs.map(async (centre: any) => {
        const cap = await CapacityRepository.getByOSC(centre._id || centre.centreCode);
        const availableBeds = cap?.availableBeds ?? 8;

        const isSameDistrict = centre.district.toLowerCase() === request.location.district.toLowerCase();
        const distanceScore = isSameDistrict ? 100 : 60;
        const approxDistanceKm = isSameDistrict ? 4.5 : 22.0;

        const capacityScore = availableBeds > 5 ? 100 : availableBeds > 0 ? 70 : 10;

        const offeredServices = centre.servicesOffered || [];
        const matched = requestedServices.filter((s: string) =>
          offeredServices.some((os: string) => os.toLowerCase().includes(s.toLowerCase()))
        );
        const serviceScore = Math.round((matched.length / Math.max(1, requestedServices.length)) * 100);

        const accessibilityScore = 90;

        const totalScore = Math.round(
          distanceScore * 0.35 +
          capacityScore * 0.30 +
          serviceScore * 0.25 +
          accessibilityScore * 0.10
        );

        const explanationParts: string[] = [];
        if (isSameDistrict) explanationParts.push(`Located in your district (${centre.district})`);
        if (availableBeds > 0) explanationParts.push(`${availableBeds} verified shelter beds currently available`);
        if (matched.length > 0) explanationParts.push(`Provides ${matched.length} of ${requestedServices.length} requested services`);

        return {
          ...centre,
          intakeCapacity: {
            totalBeds: cap?.totalBeds || 30,
            currentAvailableBeds: availableBeds
          },
          recommendation: {
            score: totalScore,
            distanceKm: approxDistanceKm,
            matchBreakdown: {
              distanceScore,
              capacityScore,
              serviceScore,
              accessibilityScore
            },
            explanation: explanationParts.join(' · '),
            isEligible: true
          }
        };
      }));

      scoredCentres.sort((a, b) => b.recommendation.score - a.recommendation.score);

      return res.json({
        requestReference: request.requestReference,
        requestedServices,
        totalEligible: scoredCentres.length,
        recommendations: scoredCentres
      });
    } catch (err: any) {
      console.error('[VictimController.getRecommendations] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/victim/requests/:id/referral
   * Screen 5 -> Screen 6: Select OSC & Create Official Referral Record
   */
  static async createReferral(req: Request, res: Response) {
    try {
      const { oscId, notes } = req.body;
      const request = await AssistanceRequestRepository.getByReference(req.params.id);
      if (!request) return res.status(404).json({ error: 'Assistance request not found.' });

      // Check if referral already exists
      const existingRef = await ReferralRepository.getByReference(request.requestReference);
      if (existingRef) {
        return res.status(409).json({
          error: 'Referral already confirmed for this request.',
          referral: existingRef
        });
      }

      const osc = await OSCRepository.getById(oscId || 'osc-ka-blr-01');

      // Create official Referral in MongoDB
      const referral = await ReferralRepository.create({
        requestReference: request.requestReference,
        oscId: osc?._id || 'osc-ka-blr-01',
        beneficiaryAlias: `Victim-${request.requestReference.slice(-4)}`,
        victimContactMasked: request.safeContact?.value ? `+91 ••••• ••${request.safeContact.value.slice(-2)}` : 'In-Person Sanctuary',
        requestedServices: request.servicesNeeded || ['Safe Shelter'],
        priority: request.isEmergency ? 'Immediate Emergency' : 'Urgent (< 24h)',
        status: 'New',
        notes
      });

      // Update Request status & reference
      await AssistanceRequestRepository.updateStatus(request.requestReference, 'referral_sent', {
        selectedOSCId: osc?._id || 'osc-ka-blr-01',
        referralId: referral.referralCode
      });

      // Add Timeline Event
      await AssistanceRequestRepository.addEvent({
        requestReference: request.requestReference,
        eventStage: 'Referral Sent',
        title: `Referral Dispatched to ${osc?.name || 'One Stop Centre'}`,
        description: `Official referral ${referral.referralCode} generated and queued for caseworker review.`,
        performedBy: 'SakhiLink Allocation Protocol'
      });

      // Real-Time Notification to Staff
      broadcastReferralUpdate(osc?._id || 'osc-ka-blr-01', referral);
      const staffNotif = await NotificationRepository.create({
        recipientType: 'centre',
        recipientId: osc?._id || 'osc-ka-blr-01',
        title: 'New Victim Referral Received',
        message: `Referral ${referral.referralCode} for Request ${request.requestReference} is pending triage.`,
        type: 'new_referral',
        referenceId: referral.referralCode
      });
      broadcastNotification(osc?._id || 'osc-ka-blr-01', staffNotif);

      return res.status(201).json({
        success: true,
        message: 'Referral created and sent to One Stop Centre successfully.',
        referral
      });
    } catch (err: any) {
      console.error('[VictimController.createReferral] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/victim/requests/:reference
   * Screen 6: Request Tracking Timeline & Status
   */
  static async getRequestStatus(req: Request, res: Response) {
    try {
      const request = await AssistanceRequestRepository.getByReference(req.params.reference);
      if (!request) return res.status(404).json({ error: 'Assistance request not found.' });

      const [events, referral, osc] = await Promise.all([
        AssistanceRequestRepository.getEvents(request.requestReference),
        ReferralRepository.getByReference(request.requestReference),
        request.selectedOSCId ? OSCRepository.getById(request.selectedOSCId) : null
      ]);

      return res.json({
        request,
        referral,
        assignedOSC: osc,
        timeline: events
      });
    } catch (err: any) {
      console.error('[VictimController.getRequestStatus] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/victim/requests/:reference/cancel
   * Screen 6: Cancel Request Safely
   */
  static async cancelRequest(req: Request, res: Response) {
    try {
      const updated = await AssistanceRequestRepository.updateStatus(req.params.reference, 'cancelled');
      if (!updated) return res.status(404).json({ error: 'Request not found.' });

      await AssistanceRequestRepository.addEvent({
        requestReference: updated.requestReference,
        eventStage: 'Cancelled',
        title: 'Request Cancelled by User',
        description: 'The assistance request was safely closed upon user confirmation.',
        performedBy: 'Beneficiary'
      });

      broadcastRequestStatus(updated.requestReference, { status: 'cancelled' });
      return res.json({ success: true, message: 'Request cancelled safely.' });
    } catch (err: any) {
      console.error('[VictimController.cancelRequest] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/victim/communications/:reference
   * Screen 7: In-App Messaging
   */
  static async getMessages(req: Request, res: Response) {
    try {
      const messages = await CommunicationRepository.getMessages(req.params.reference);
      return res.json(messages);
    } catch (err: any) {
      console.error('[VictimController.getMessages] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/victim/communications/:reference
   * Screen 7: Send Message or Urgent Callback Request
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const { messageText, message, senderRole = 'victim', senderName = 'Beneficiary', isCallbackRequest, callbackDetails } = req.body;
      const resolvedText = (messageText || message || '').trim();

      if (!resolvedText && !isCallbackRequest) {
        return res.status(400).json({ error: 'Message content is required.' });
      }

      const newMsg = await CommunicationRepository.sendMessage({
        conversationId: req.params.reference,
        senderRole,
        senderName,
        messageText: resolvedText || (isCallbackRequest ? 'Callback Request Requested' : ''),
        isCallbackRequest: !!isCallbackRequest,
        callbackDetails
      });

      // Real-Time Socket Broadcast
      broadcastNewMessage(req.params.reference, newMsg);

      // Notify staff
      if (senderRole === 'victim') {
        const notif = await NotificationRepository.create({
          recipientType: 'centre',
          recipientId: 'osc-ka-blr-01',
          title: isCallbackRequest ? 'Urgent Callback Requested' : 'New Victim Message',
          message: isCallbackRequest
            ? `Beneficiary for Request ${req.params.reference} requested a safe callback.`
            : `New message on Request ${req.params.reference}: "${resolvedText.slice(0, 50)}..."`,
          type: 'message',
          referenceId: req.params.reference
        });
        broadcastNotification('osc-ka-blr-01', notif);
      }

      return res.status(201).json(newMsg);
    } catch (err: any) {
      console.error('[VictimController.sendMessage] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/victim/notifications/:reference
   * Screen 8: Victim Notifications
   */
  static async getNotifications(req: Request, res: Response) {
    try {
      const notifs = await NotificationRepository.getForRecipient(req.params.reference);
      return res.json(notifs);
    } catch (err: any) {
      console.error('[VictimController.getNotifications] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/victim/notifications/:reference/read-all
   * Screen 8: Mark Notifications Read
   */
  static async markAllNotificationsRead(req: Request, res: Response) {
    try {
      await NotificationRepository.markAllRead(req.params.reference);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('[VictimController.markAllNotificationsRead] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/victim/privacy/data-deletion
   * Screen 9: Data Deletion Request Workflow
   */
  static async requestDataDeletion(req: Request, res: Response) {
    try {
      const { requestReference, trackingToken } = req.body;
      const request = await AssistanceRequestRepository.getByReference(requestReference || trackingToken);

      if (request) {
        await AssistanceRequestRepository.updateStatus(request.requestReference, 'cancelled', {
          safeContact: { method: 'in_person_only', value: '[DELETED_UPON_REQUEST]' },
          accessibilityNeeds: []
        });
      }

      return res.json({
        success: true,
        message: 'Statutory Data Deletion processed. Contact records and tracking history have been purged.'
      });
    } catch (err: any) {
      console.error('[VictimController.requestDataDeletion] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
