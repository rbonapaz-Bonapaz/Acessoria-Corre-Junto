
'use server';
/**
 * @fileOverview Fluxo Genkit para analisar o desempenho do atleta e fornecer feedback biomecânico.
 *
 * - analyzeWorkout - Função que compara o treino prescrito com o realizado.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeWorkoutInputSchema = z.object({
  prescribedWorkout: z.string().describe('Detalhes do treino que foi planejado.'),
  athleteFeedback: z.string().describe('Relato subjetivo do atleta sobre o treino.'),
  fileDataUri: z.string().optional().describe("URI de dados do arquivo (.FIT, .CSV ou Imagem) baseada em Base64."),
  athleteProfile: z.string().describe('Dados fisiológicos do atleta (Pace T, FC Limiar).'),
});

export type AnalyzeWorkoutInput = z.infer<typeof AnalyzeWorkoutInputSchema>;

const AnalyzeWorkoutOutputSchema = z.object({
  actualMetrics: z.object({
    averagePace: z.string().describe('Pace médio extraído ou estimado.'),
    averageCadence: z.string().describe('Cadência média (ppm).'),
    strideRatio: z.number().describe('Razão da passada em porcentagem.'),
    groundContactTime: z.string().optional().describe('Tempo de contato com o solo em ms.'),
    verticalOscillation: z.string().optional().describe('Oscilação vertical em cm.'),
  }),
  analysisSummary: z.object({
    summary: z.string().describe('Resumo da sessão e cumprimento do objetivo.'),
    technicalReview: z.string().describe('Análise técnica da biomecânica.'),
  }),
  recommendations: z.string().describe('O que o atleta deve focar no próximo treino.'),
  areasOfImprovement: z.array(z.string()).describe('Lista de pontos para evoluir.'),
});

export type AnalyzeWorkoutOutput = z.infer<typeof AnalyzeWorkoutOutputSchema>;

export async function analyzeWorkout(input: AnalyzeWorkoutInput): Promise<AnalyzeWorkoutOutput> {
  return analyzeWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWorkoutPrompt',
  input: { schema: AnalyzeWorkoutInputSchema },
  output: { schema: AnalyzeWorkoutOutputSchema },
  prompt: `Você é um biomecânico de corrida de elite. Analise os dados do treino realizado.

Prescrição: {{{prescribedWorkout}}}
Feedback do Atleta: {{{athleteFeedback}}}
Perfil: {{{athleteProfile}}}
Evidência: {{#if fileDataUri}}{{media url=fileDataUri}}{{else}}Nenhum arquivo anexado.{{/if}}

Sua tarefa:
1. Extraia ou estime (com base no feedback e evidência) as métricas de Pace, Cadência e Razão de Passada.
2. Compare se o atleta cumpriu o objetivo do treino.
3. Se a Razão de Passada (Stride Ratio) estiver acima de 11%, gere um alerta de desperdício de energia.
4. Forneça recomendações técnicas (ex: aumentar cadência, focar na postura).

Responda sempre em PORTUGUÊS (Brasil).`,
});

const analyzeWorkoutFlow = ai.defineFlow(
  {
    name: 'analyzeWorkoutFlow',
    inputSchema: AnalyzeWorkoutInputSchema,
    outputSchema: AnalyzeWorkoutOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
