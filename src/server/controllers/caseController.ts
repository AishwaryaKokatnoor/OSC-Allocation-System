import { Response } from 'express';
import { CaseRepository } from '../db/repository';
import { AuthenticatedRequest } from '../middleware/auth';

export class CaseController {
  /**
   * GET /api/cases
   * Retrieve all active and historical cases for this centre
   */
  static async getCases(_req: AuthenticatedRequest, res: Response) {
    try {
      const cases = await CaseRepository.getAll('osc-ka-blr-01');
      return res.json(cases);
    } catch (err: any) {
      console.error('[CaseController.getCases] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /api/cases/:id/status
   * Update the status of a case record
   */
  static async updateCaseStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await CaseRepository.updateStatus(req.params.id, req.body.status);
      if (!updated) {
        return res.status(404).json({ error: 'Case record not found.' });
      }
      return res.json(updated);
    } catch (err: any) {
      console.error('[CaseController.updateCaseStatus] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/cases/:id/notes
   * Fetch confidential case notes for authorized staff
   */
  static async getCaseNotes(req: AuthenticatedRequest, res: Response) {
    try {
      const notes = await CaseRepository.getNotes(req.params.id);
      return res.json(notes);
    } catch (err: any) {
      console.error('[CaseController.getCaseNotes] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/cases/:id/notes
   * Append an encrypted case progress note
   */
  static async addCaseNote(req: AuthenticatedRequest, res: Response) {
    try {
      const note = await CaseRepository.addNote({
        caseId: req.params.id,
        authorId: req.user?.userId || 'usr-01',
        authorName: req.user?.name || 'Authorized Staff',
        authorRole: req.user?.role === 'centre_manager' ? 'Centre Administrator' : 'Case Coordinator',
        encryptedContent: req.body.encryptedContent,
        isRestricted: true
      });
      return res.status(201).json(note);
    } catch (err: any) {
      console.error('[CaseController.addCaseNote] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
