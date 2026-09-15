import { Request, Response } from 'express';
import { ComputeService } from '../services/compute.service';

export class ComputeController {
  private computeService: ComputeService;

  constructor(computeService?: ComputeService) {
    this.computeService = computeService || new ComputeService();
  }

  submitJob = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const { name, type, payload } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'name et type sont requis',
        });
      }

      const job = await this.computeService.submitJob({ tenantId, name, type, payload });

      return res.status(201).json({
        success: true,
        data: job,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la soumission du job',
      });
    }
  };

  runJob = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this.computeService.runJob(id);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const status = error.message === 'Job introuvable' ? 404 : 500;
      return res.status(status).json({
        success: false,
        error: error.message,
      });
    }
  };

  listJobs = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const status = req.query?.status as string | undefined;
      const type = req.query?.type as string | undefined;
      const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 50;

      const jobs = await this.computeService.listJobs(tenantId, { status, type, limit });

      return res.json({
        success: true,
        data: jobs,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la recuperation des jobs',
      });
    }
  };

  cancelJob = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this.computeService.cancelJob(id);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const status = error.message === 'Job introuvable' ? 404 : 400;
      return res.status(status).json({
        success: false,
        error: error.message,
      });
    }
  };
}
