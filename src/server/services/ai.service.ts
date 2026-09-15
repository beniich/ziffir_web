import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma as defaultPrisma } from '../lib/prisma.js';

export interface TrafficLogInput {
  nodeId: string;
  latency: number;
  bytesTransferred: number;
  timestamp: Date;
  protocol?: string;
}

export interface MetricsInput {
  errorRate: number;
  avgLatency: number;
  totalRequests: number;
  topErrors?: Array<{ path: string; count: number }>;
}

export interface AnalysisResult {
  summary: string;
  anomalies: Array<{ type: string; severity: string; [key: string]: string }>;
  recommendations: string[];
}

const GEMINI_MODEL = 'gemini-1.5-flash';

export class AiService {
  private prisma: PrismaClient;
  private gemini: GoogleGenerativeAI;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  private parseGeminiResponse(text: string): AnalysisResult {
    try {
      // Strip markdown code blocks if present
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        summary: text,
        anomalies: [],
        recommendations: [],
      };
    }
  }

  async analyzeTrafficLogs(tenantId: string, logs: TrafficLogInput[]): Promise<AnalysisResult> {
    const record = await this.prisma.aiAnalysis.create({
      data: {
        tenantId,
        type: 'LOG_ANALYSIS',
        status: 'PENDING',
        model: GEMINI_MODEL,
        inputSummary: `${logs.length} entrées de trafic`,
      },
    });

    try {
      const promptData = logs.slice(0, 50).map((l) => ({
        node: l.nodeId,
        latencyMs: l.latency,
        bytes: l.bytesTransferred,
        ts: l.timestamp,
      }));

      const prompt = `Tu es un expert en analyse de trafic réseau. Analyse ces métriques d'un réseau edge cloud et détecte les anomalies.
Données (50 entrées max): ${JSON.stringify(promptData, null, 2)}

Réponds UNIQUEMENT avec un JSON valide (sans markdown) de la forme:
{
  "summary": "résumé court de l'état du réseau",
  "anomalies": [{"type": "string", "severity": "HIGH|MEDIUM|LOW", "nodeId": "string", "detail": "string"}],
  "recommendations": ["liste d'actions recommandées"]
}`;

      const model = this.gemini.getGenerativeModel({ model: GEMINI_MODEL });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const result = this.parseGeminiResponse(text);

      const usage = (response.response as any).usageMetadata;
      await this.prisma.aiAnalysis.update({
        where: { id: record.id },
        data: {
          status: 'DONE',
          result: JSON.stringify(result),
          promptTokens: usage?.promptTokenCount,
          outputTokens: usage?.candidatesTokenCount,
        },
      });

      return result;
    } catch (error) {
      await this.prisma.aiAnalysis.update({
        where: { id: record.id },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  async detectAnomalies(tenantId: string, metrics: MetricsInput): Promise<AnalysisResult> {
    const record = await this.prisma.aiAnalysis.create({
      data: {
        tenantId,
        type: 'ANOMALY_DETECTION',
        status: 'PENDING',
        model: GEMINI_MODEL,
        inputSummary: `errorRate=${metrics.errorRate}, avgLatency=${metrics.avgLatency}ms`,
      },
    });

    try {
      const prompt = `Tu es un expert en SRE et observabilité. Analyse ces métriques de performance et identifie les anomalies.
Métriques: ${JSON.stringify(metrics, null, 2)}

Seuils de référence:
- errorRate normal < 0.01 (1%)
- avgLatency normale < 200ms
- Latence > 500ms = anomalie grave

Réponds UNIQUEMENT avec un JSON valide (sans markdown) de la forme:
{
  "summary": "état global de santé",
  "anomalies": [{"type": "string", "severity": "HIGH|MEDIUM|LOW", "metric": "string", "value": "string", "threshold": "string"}],
  "recommendations": ["actions correctives"]
}`;

      const model = this.gemini.getGenerativeModel({ model: GEMINI_MODEL });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const result = this.parseGeminiResponse(text);

      const usage = (response.response as any).usageMetadata;
      await this.prisma.aiAnalysis.update({
        where: { id: record.id },
        data: {
          status: 'DONE',
          result: JSON.stringify(result),
          promptTokens: usage?.promptTokenCount,
          outputTokens: usage?.candidatesTokenCount,
        },
      });

      return result;
    } catch (error) {
      await this.prisma.aiAnalysis.update({
        where: { id: record.id },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  async getAnalysisHistory(tenantId: string, limit: number = 20) {
    return this.prisma.aiAnalysis.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
