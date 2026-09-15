import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { storageController } from '../controllers/storage.controller';
import { storageService } from '../services/storage.service';

describe('📦 StorageController Unit Tests', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.restoreAllMocks();
    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getUploadUrl', () => {
    it('should return presigned upload URL', async () => {
      req.body = { fileName: 'test.png', mimeType: 'image/png' };
      jest.spyOn(storageService, 'getUploadUrl').mockResolvedValue({
        uploadUrl: 'https://r2.cloudflarestorage.com/signed-url',
        key: 'files/test.png',
        expiresIn: 3600,
      });

      await storageController.getUploadUrl(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        uploadUrl: 'https://r2.cloudflarestorage.com/signed-url',
        key: 'files/test.png',
        expiresIn: 3600,
      });
    });

    it('should return 400 when fileName is missing', async () => {
      req.body = { mimeType: 'image/png' };

      await storageController.getUploadUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('registerMetadata', () => {
    it('should register file metadata and return 201', async () => {
      req.body = {
        key: 'k1',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
      };
      const mockMeta = { id: 'm1', key: 'k1', fileName: 'doc.pdf' };
      jest.spyOn(storageService, 'registerFile').mockResolvedValue(mockMeta as any);

      await storageController.registerMetadata(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, file: mockMeta });
    });
  });
});
