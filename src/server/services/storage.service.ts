import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma as defaultPrisma } from '../lib/prisma.js';

export interface PresignedUploadOptions {
  fileName: string;
  mimeType: string;
  tenantId?: string;
  uploaderId?: string;
  expiresIn?: number;
}

export interface RegisterFileInput {
  key: string;
  fileName: string;
  mimeType: string;
  sizeBytes?: number | bigint;
  bucket?: string;
  publicUrl?: string;
  uploaderId?: string;
  tenantId?: string;
}

export class StorageService {
  private db: any;
  private s3: S3Client;
  private defaultBucket: string;

  constructor(prismaClient: any = defaultPrisma, s3Client?: any) {
    this.db = prismaClient;
    this.defaultBucket = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'zaphir-assets';

    this.s3 = s3Client || new S3Client({
      region: process.env.AWS_REGION || 'auto',
      endpoint: process.env.R2_ENDPOINT || process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || 'mock-key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || 'mock-secret',
      },
    });
  }

  /**
   * Construit une clé d'objet unique et sécurisée.
   */
  generateKey(tenantId: string = 'global', fileName: string): string {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substring(2, 8);
    return `${tenantId}/${timestamp}-${randomHex}-${cleanFileName}`;
  }

  /**
   * Génère une URL pré-signée pour téléverser directement vers Cloudflare R2 ou AWS S3.
   */
  async getUploadUrl(options: PresignedUploadOptions) {
    if (!options.fileName) {
      throw new Error('fileName requis');
    }

    const key = this.generateKey(options.tenantId, options.fileName);
    const expiresIn = options.expiresIn || 3600;

    const command = new PutObjectCommand({
      Bucket: this.defaultBucket,
      Key: key,
      ContentType: options.mimeType || 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });

    return {
      uploadUrl,
      key,
      bucket: this.defaultBucket,
      expiresIn,
    };
  }

  /**
   * Génère une URL pré-signée de téléchargement (téléchargement sécurisé à expiration).
   */
  async getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!key) {
      throw new Error('file key requise');
    }

    const command = new GetObjectCommand({
      Bucket: this.defaultBucket,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, { expiresIn });
  }

  /**
   * Enregistre les métadonnées d'un fichier dans la base de données.
   */
  async registerFile(data: RegisterFileInput) {
    if (!data.key || !data.fileName) {
      throw new Error('key et fileName requis');
    }

    return await this.db.fileMetadata.create({
      data: {
        key: data.key,
        fileName: data.fileName,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes ? BigInt(data.sizeBytes) : null,
        bucket: data.bucket || this.defaultBucket,
        publicUrl: data.publicUrl,
        uploaderId: data.uploaderId,
        tenantId: data.tenantId,
      }
    });
  }

  /**
   * Récupère les métadonnées d'un fichier.
   */
  async getFile(key: string) {
    if (!key) {
      throw new Error('file key requise');
    }

    return await this.db.fileMetadata.findUnique({
      where: { key }
    });
  }

  /**
   * Liste les fichiers enregistrés pour un tenant.
   */
  async listFiles(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    return await this.db.fileMetadata.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const storageService = new StorageService();
