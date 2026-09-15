import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StorageService } from '../services/storage.service';

describe('📦 StorageService (Sprint 2 - R2 / S3 Storage)', () => {
  let mockPrisma: any;
  let mockS3Client: any;
  let service: StorageService;

  beforeEach(() => {
    mockPrisma = {
      fileMetadata: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      }
    };
    mockS3Client = {
      send: jest.fn(),
    };
    service = new StorageService(mockPrisma, mockS3Client);
  });

  describe('generateKey', () => {
    it('should generate a structured object key with timestamp and slug', () => {
      const key = service.generateKey('tenant-abc', 'report.pdf');
      expect(key).toContain('tenant-abc/');
      expect(key).toContain('report.pdf');
    });
  });

  describe('registerFile', () => {
    it('should register file metadata in DB', async () => {
      const mockRecord = {
        id: 'file-1',
        key: 'tenant-1/asset.png',
        fileName: 'asset.png',
        mimeType: 'image/png',
        bucket: 'ziffir-assets',
        tenantId: 'tenant-1',
      };
      mockPrisma.fileMetadata.create.mockResolvedValue(mockRecord);

      const result = await service.registerFile({
        key: 'tenant-1/asset.png',
        fileName: 'asset.png',
        mimeType: 'image/png',
        bucket: 'ziffir-assets',
        tenantId: 'tenant-1',
      });

      expect(result).toEqual(mockRecord);
      expect(mockPrisma.fileMetadata.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFile', () => {
    it('should retrieve file metadata by key', async () => {
      mockPrisma.fileMetadata.findUnique.mockResolvedValue({
        id: 'file-1',
        key: 'k1',
        fileName: 'test.txt'
      });

      const file = await service.getFile('k1');
      expect(file.fileName).toBe('test.txt');
    });
  });
});
