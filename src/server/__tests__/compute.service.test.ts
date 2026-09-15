import { ComputeService } from '../services/compute.service';

describe('ComputeService', () => {
  let service: ComputeService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      computeJob: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    service = new ComputeService(mockPrisma);
  });

  describe('submitJob', () => {
    it('cree un job en statut QUEUED', async () => {
      mockPrisma.computeJob.create.mockResolvedValue({
        id: 'job-1',
        tenantId: 'tenant-1',
        name: 'export-monthly-report',
        type: 'BATCH',
        status: 'QUEUED',
      });

      const job = await service.submitJob({
        tenantId: 'tenant-1',
        name: 'export-monthly-report',
        type: 'BATCH',
        payload: { month: '2026-08', format: 'pdf' },
      });

      expect(mockPrisma.computeJob.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          name: 'export-monthly-report',
          type: 'BATCH',
          status: 'QUEUED',
          payload: JSON.stringify({ month: '2026-08', format: 'pdf' }),
        }),
      });
      expect(job.id).toBe('job-1');
      expect(job.status).toBe('QUEUED');
    });

    it('rejette si name ou type absent', async () => {
      await expect(
        service.submitJob({
          tenantId: 'tenant-1',
          name: '',
          type: 'BATCH',
        })
      ).rejects.toThrow('name et type sont obligatoires');
    });
  });

  describe('runJob', () => {
    it('execute le job et met a jour RUNNING puis DONE', async () => {
      mockPrisma.computeJob.findUnique.mockResolvedValue({
        id: 'job-1',
        type: 'BATCH',
        status: 'QUEUED',
        payload: '{"month":"2026-08"}',
      });
      mockPrisma.computeJob.update.mockResolvedValue({ id: 'job-1', status: 'DONE' });

      const result = await service.runJob('job-1');

      expect(mockPrisma.computeJob.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.computeJob.update).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { id: 'job-1' },
          data: expect.objectContaining({ status: 'RUNNING' }),
        })
      );
      expect(mockPrisma.computeJob.update).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: { id: 'job-1' },
          data: expect.objectContaining({ status: 'DONE' }),
        })
      );
      expect(result.status).toBe('DONE');
    });

    it('marque FAILED si le job est introuvable', async () => {
      mockPrisma.computeJob.findUnique.mockResolvedValue(null);

      await expect(service.runJob('job-ghost')).rejects.toThrow('Job introuvable');
    });
  });

  describe('listJobs', () => {
    it('liste les jobs filtrés par statut', async () => {
      mockPrisma.computeJob.findMany.mockResolvedValue([
        { id: 'job-1', status: 'DONE' },
        { id: 'job-2', status: 'DONE' },
      ]);

      const jobs = await service.listJobs('tenant-1', { status: 'DONE', limit: 10 });

      expect(mockPrisma.computeJob.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', status: 'DONE' },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(jobs).toHaveLength(2);
    });
  });

  describe('cancelJob', () => {
    it('met le job en statut CANCELLED', async () => {
      mockPrisma.computeJob.findUnique.mockResolvedValue({ id: 'job-1', status: 'QUEUED' });
      mockPrisma.computeJob.update.mockResolvedValue({ id: 'job-1', status: 'CANCELLED' });

      const result = await service.cancelJob('job-1');
      expect(result.status).toBe('CANCELLED');
    });

    it("rejette si le job est deja DONE", async () => {
      mockPrisma.computeJob.findUnique.mockResolvedValue({ id: 'job-1', status: 'DONE' });

      await expect(service.cancelJob('job-1')).rejects.toThrow("Impossible d'annuler un job termine");
    });
  });
});
