
'use server';
/**
 * @fileOverview Fluxo Genkit para analisar o desempenho do atleta e fornecer feedback biomecânico ou interpretar orientações.
 */

import { getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeWorkoutInputSchema = z.object({
  apiKey: z.string().optional().describe('A chave de API do usuário para o processamento.'),
  prescribedWorkout: z.string().describe('Detalhes do treino planejado.'),
  athleteFeedback: z.string().describe('Relato do atleta.'),
  fileDataUri: z.string().optional().describe("URI de dados do arquivo/imagem/PDF."),
  athleteProfile: z.string().describe('Dados do atleta.'),
});

export type AnalyzeWorkoutInput = z.infer<typeof AnalyzeWorkoutInputSchema>;

const AnalyzeWorkoutOutputSchema = z.object({
  actualMetrics: z.object({
    averagePace: z.string().describe('Pace médio.'),
    averageCadence: z.string().describe('Cadência média.'),
    strideRatio: z.number().describe('Razão da passada (%).'),
    groundContactTime: z.string().optional().describe('TCS em ms.'),
    verticalOscillation: z.string().optional().describe('Oscilação em cm.'),
  }),
  analysisSummary: z.object({
    summary: z.string().describe('Resumo.'),
    technicalReview: z.string().describe('Análise técnica.'),
  }),
  recommendations: z.string().describe('Foco no próximo.'),
  areasOfImprovement: z.array(z.string()).describe('Pontos de evolução.'),
});

export type AnalyzeWorkoutOutput = z.infer<typeof AnalyzeWorkoutOutputSchema>;

export async function analyzeWorkout(input: AnalyzeWorkoutInput): Promise<AnalyzeWorkoutOutput> {
  const aiInstance = getAiWithKey(input.apiKey);

  const { output } = await aiInstance.generate({
    model: 'googleai/gemini-1.5-flash',
    system: 'Você é um biomecânico e treinador de corrida de elite. Analise os dados em PORTUGUÊS. Se o arquivo for um PDF, ele pode conter métricas de treino ou novas orientações de como você deve ajustar o plano futuro.',
    prompt: [
      { text: `Prescrição Atual: ${input.prescribedWorkout}` },
      { text: `Feedback do Atleta: ${input.athleteFeedback}` },
      { text: `Perfil Biométrico: ${input.athleteProfile}` },
      ...(input.fileDataUri ? [{ media: { url: input.fileDataUri } }] : []),
      { text: 'Extraia métricas se for um arquivo de dados, ou interprete as orientações de texto se for um PDF/Print. Forneça uma análise técnica profunda comparando o realizado com o planejado.' }
    ],
    output: { schema: AnalyzeWorkoutOutputSchema }
  });

  if (!output) throw new Error('Falha ao analisar o treino.');
  return output;
}
