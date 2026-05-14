'use server';
/**
 * @fileOverview Fluxo Genkit para analisar o desempenho biomecânico do atleta na API v1.
 */

import { getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeWorkoutInputSchema = z.object({
  apiKey: z.string().optional().describe('A chave de API do usuário.'),
  prescribedWorkout: z.string().describe('Treino planejado.'),
  athleteFeedback: z.string().describe('Relato do atleta.'),
  fileDataUri: z.string().optional().describe("URI de dados do arquivo."),
  athleteProfile: z.string().describe('Dados do atleta.'),
});

export type AnalyzeWorkoutInput = z.infer<typeof AnalyzeWorkoutInputSchema>;

const AnalyzeWorkoutOutputSchema = z.object({
  actualMetrics: z.object({
    averagePace: z.string(),
    averageCadence: z.string(),
    strideRatio: z.number(),
    groundContactTime: z.string().optional(),
    verticalOscillation: z.string().optional(),
  }),
  analysisSummary: z.object({
    summary: z.string(),
    technicalReview: z.string(),
  }),
  recommendations: z.string(),
  areasOfImprovement: z.array(z.string()),
});

export type AnalyzeWorkoutOutput = z.infer<typeof AnalyzeWorkoutOutputSchema>;

export async function analyzeWorkout(input: AnalyzeWorkoutInput): Promise<AnalyzeWorkoutOutput> {
  const aiInstance = getAiWithKey(input.apiKey);

  const { text } = await aiInstance.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: [
      { text: `SISTEMA: Analise biomecânica em PORTUGUÊS (Brasil) operando na versão v1 estável.
      Responda APENAS com JSON válido.
      
      DADOS:
      Treino: ${input.prescribedWorkout}
      Feedback: ${input.athleteFeedback}
      Perfil: ${input.athleteProfile}
      
      FORMATO JSON:
      {
        "actualMetrics": {
          "averagePace": "string",
          "averageCadence": "string",
          "strideRatio": number
        },
        "analysisSummary": {
          "summary": "string",
          "technicalReview": "string"
        },
        "recommendations": "string",
        "areasOfImprovement": ["string"]
      }` },
      ...(input.fileDataUri ? [{ media: { url: input.fileDataUri } }] : []),
    ],
    config: { temperature: 0.4 }
  });

  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as AnalyzeWorkoutOutput;
  } catch (e) {
    throw new Error('Erro ao processar análise biomecânica (API v1).');
  }
}
