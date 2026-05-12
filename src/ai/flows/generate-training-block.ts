'use server';
/**
 * @fileOverview Um fluxo Genkit para gerar blocos de treinamento personalizados de 4 semanas.
 *
 * - generateTrainingBlock - Função que lida com o processo de geração do bloco de treino.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTrainingBlockInputSchema = z.object({
  currentVDOT: z.number().describe('Score VDOT atual, indicando o nível de condicionamento.'),
  hrZone1End: z.number().describe('Frequência cardíaca ao final da Zona 1.'),
  hrZone2End: z.number().describe('Frequência cardíaca ao final da Zona 2.'),
  hrZone3End: z.number().describe('Frequência cardíaca ao final da Zona 3.'),
  hrZone4End: z.number().describe('Frequência cardíaca ao final da Zona 4.'),
  hrMax: z.number().describe('Frequência cardíaca máxima.'),
  trainingBlockType: z
    .enum(['Base', 'Construction', 'Polishing'])
    .describe('Tipo de bloco de treino (Base, Construção ou Polimento).'),
  weeklyMileageGoal: z.number().describe('Meta de volume semanal em km.'),
  targetRaceDistance: z.string().describe('Distância da prova alvo (ex: 5K, Maratona).'),
  targetRaceTime: z.string().optional().describe('Opcional: Tempo alvo (ex: 3:30:00).'),
  currentLongRunDistance: z.number().describe('Distância atual do longão em km.'),
  currentLongRunPace: z.string().describe('Ritmo atual do longão (ex: 5:30/km).'),
  weeklyAvailability: z.string().describe('Disponibilidade semanal.'),
  injuryHistory: z.string().describe('Histórico de lesões relevantes.'),
  preferredWorkoutDays: z.string().describe('Dias preferidos para treinos intensos.'),
});

export type GenerateTrainingBlockInput = z.infer<typeof GenerateTrainingBlockInputSchema>;

const WeeklyPlanSchema = z.object({
  weekNumber: z.number().describe('Número da semana no bloco (1-4).'),
  focus: z.string().describe('Foco principal da semana (ex: Resistência, Velocidade, Recuperação).'),
  runs: z.array(
    z.object({
      day: z.string().describe('Dia da semana (ex: Segunda-feira).'),
      type: z.string().describe('Tipo de treino (ex: Rodagem Leve, Tempo, Intervalado, Longão).'),
      distance: z.string().describe('Distância do treino (ex: 8 km).'),
      paceZone: z.string().describe('Zona de ritmo ou ritmo específico (ex: Zona 2 FC, Ritmo T VDOT).'),
      description: z.string().describe('Descrição detalhada do treino em português.'),
    })
  ).describe('Lista de treinos de corrida para a semana.'),
  strength: z.string().describe('Recomendações de treinamento de força.'),
  crossTraining: z.string().describe('Recomendações de cross-training.'),
  notes: z.string().describe('Notas gerais ou conselhos para a semana.'),
});

const GenerateTrainingBlockOutputSchema = z.object({
  blockType: z.string().describe('O tipo de bloco gerado traduzido para português.'),
  durationWeeks: z.literal(4).describe('Duração em semanas, sempre 4.'),
  weeklyPlans: z.array(WeeklyPlanSchema).length(4).describe('Array com 4 planos semanais.'),
});

export type GenerateTrainingBlockOutput = z.infer<typeof GenerateTrainingBlockOutputSchema>;

export async function generateTrainingBlock(input: GenerateTrainingBlockInput): Promise<GenerateTrainingBlockOutput> {
  return generateTrainingBlockFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrainingBlockPrompt',
  input: { schema: GenerateTrainingBlockInputSchema },
  output: { schema: GenerateTrainingBlockOutputSchema },
  prompt: `Você é um treinador de corrida IA especializado em gerar blocos de treinamento de 4 semanas baseados na lógica VDOT e zonas de frequência cardíaca.
Seu objetivo é criar um plano estruturado e progressivo em PORTUGUÊS (Brasil).

Perfil do Corredor:
- VDOT Atual: {{{currentVDOT}}}
- Zonas de FC (BPM): Zona 1 até {{{hrZone1End}}}, Z2 até {{{hrZone2End}}}, Z3 até {{{hrZone3End}}}, Z4 até {{{hrZone4End}}}. Máx: {{{hrMax}}}.
- Tipo de Bloco: {{{trainingBlockType}}} (Base: aeróbico; Construction: específico; Polishing: polimento/taper).
- Volume Semanal Alvo: {{{weeklyMileageGoal}}} km.
- Prova Alvo: {{{targetRaceDistance}}}{{#if targetRaceTime}} (Tempo Alvo: {{{targetRaceTime}}}){{/if}}
- Longão Atual: {{{currentLongRunDistance}}} km a {{{currentLongRunPace}}}
- Disponibilidade: {{{weeklyAvailability}}}
- Histórico de Lesões: {{{injuryHistory}}}
- Dias de Treino Intenso: {{{preferredWorkoutDays}}}

Desenvolva um bloco de 4 semanas. Use os princípios VDOT para ritmos e zonas de FC para esforço. Inclua rodagens, longões, treinos de velocidade, força e cross-training.

TODA A RESPOSTA, INCLUINDO DESCRIÇÕES E NOTAS, DEVE ESTAR EM PORTUGUÊS.

Exemplo de descrição de treino:
"Aquecimento: 15 min trote leve. Parte Principal: 4 x 1000m em Ritmo I (VDOT) com 2 min de descanso parado ou trote. Desaquecimento: 10 min trote leve."

Estruture a saída estritamente conforme o JSON schema. O campo blockType deve ser retornado em português (ex: "Construção").
`,
});

const generateTrainingBlockFlow = ai.defineFlow(
  {
    name: 'generateTrainingBlockFlow',
    inputSchema: GenerateTrainingBlockInputSchema,
    outputSchema: GenerateTrainingBlockOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
