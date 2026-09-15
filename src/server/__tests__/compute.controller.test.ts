import { Response } from 'express';
import { ComputeController } from '../controllers/compute.controller';

describe('ComputeController', () => {
  let controller: ComputeController;
  let mockComputeService: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockComputeService = {
      submitJob: jest.fn(),
      runJob: jest.fn(),
      listJobs: jest.fn(),
      cancelJob: jest.fn(),
    };
    controller = new ComputeController(mockComputeService);

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('submitJob', () => {
    it('renvoie 201 avec le job cree', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: { name: 'daily-backup', type: 'BATCH', payload: { target: 'postgres' } },
      };

      mockComputeService.submitJob.mockResolvedValue({
        id: 'job-1',
        name: 'daily-backup',
        type: 'BATCH',
        status: 'QUEUED',
      });

      await controller.submitJob(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: 'job-1', status: 'QUEUED' }),
        })
      );
    });

    it('renvoie 400 si name est absent', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: { type: 'BATCH' },
      };

      await controller.submitJob(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('runJob', () => {
    it('renvoie 200 avec le job DONE', async () => {
      const mockReq: any = {
        params: { id: 'job-1' },
      };

      mockComputeService.runJob.mockResolvedValue({ id: 'job-1', status: 'DONE' });

      await controller.runJob(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ status: 'DONE' }),
        })
      );
    });
  });

  describe('listJobs', () => {
    it('renvoie 200 avec la liste des jobs', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        query: { status: 'DONE', limit: '10' },
      };

      mockComputeService.listJobs.mockResolvedValue([
        { id: 'job-1', status: 'DONE' },
        { id: 'job-2', status: 'DONE' },
      ]);

      await controller.listJobs(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([expect.objectContaining({ id: 'job-1' })]),
        })
      );
    });
  });

  describe('cancelJob', () => {
    it('renvoie 200 avec statut CANCELLED', async () => {
      const mockReq: any = {
        params: { id: 'job-1' },
      };

      mockComputeService.cancelJob.mockResolvedValue({ id: 'job-1', status: 'CANCELLED' });

      await controller.cancelJob(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ status: 'CANCELLED' }),
        })
      );
    });
  });
});
