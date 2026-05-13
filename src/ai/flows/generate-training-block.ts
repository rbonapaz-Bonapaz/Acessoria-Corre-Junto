
'use server';
/**
 * @fileOverview Fluxo Genkit para gerar blocos de treinamento personalizados.
 * 
 * - generateTrainingBlock - Função principal para gerar o plano.
 * - GenerateTrainingBlockInput - Esquema de entrada.
 * - GenerateTrainingBlockOutput - Esquema de saída.
 */

import { getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTrainingBlockInputSchema = z.object({
  apiKey: z.string().optional().describe('Chave de API do usuário.'),
  raceName: z.string().optional().describe('Nome da prova alvo.'),
  currentVDOT: z.number().describe('Score VDOT atual.'),
  hrZone1End: z.number().describe('FC final Z1.'),
  hrZone2End: z.number().describe('FC final Z2.'),
  hrZone3End: z.number().describe('FC final Z3.'),
  hrZone4End: z.number().describe('FC final Z4.'),
  hrMax: z.number().describe('FC máxima.'),
  trainingBlockType: z.enum(['Base', 'Construction', 'Polishing']).describe('Fase do bloco.'),
  planGenerationType: z.enum(['full', 'blocks']).describe('Estratégia: 4 semanas ou ciclo completo.'),
  raceDate: z.string().describe('Data da prova.'),
  weeklyMileageGoal: z.number().describe('Meta de volume semanal em km.'),
  targetRaceDistance: z.string().describe('Distância alvo.'),
  targetPace: z.string().optional().describe('Pace alvo (min/km).'),
  targetTime: z.string().optional().describe('Tempo alvo (HH:MM:SS).'),
  currentLongRunDistance: z.number().describe('Distância atual do longão.'),
  weeklyAvailability: z.string().describe('Dias disponíveis.'),
  injuryHistory: z.string().describe('Histórico de lesões.'),
  preferredWorkoutDays: z.string().describe('Dias intensos.'),
  legDay: z.string().optional().describe('Dia de treino de perna.'),
  referenceFileDataUri: z.string().optional().describe('URI de arquivo de referência.'),
});

export type GenerateTrainingBlockInput = z.infer<typeof GenerateTrainingBlockInputSchema>;

const WorkoutSchema = z.object({
  id: z.string().describe('ID único.'),
  day: z.string().describe('Dia da semana.'),
  type: z.string().describe('Tipo de treino.'),
  distance: z.string().describe('Distância.'),
  paceZone: z.string().describe('Zona de ritmo.'),
  description: z.string().describe('Descrição detalhada.'),
});

const WeeklyPlanSchema = z.object({
  weekNumber: z.number().describe('Número da semana.'),
  focus: z.string().describe('Foco da semana.'),
  runs: z.array(WorkoutSchema).describe('Lista de treinos.'),
  strength: z.string().describe('Recomendações de força.'),
  notes: z.string().describe('Notas gerais.'),
});

const GenerateTrainingBlockOutputSchema = z.object({
  blockType: z.string().describe('Descrição da fase.'),
  durationWeeks: z.number().describe('Semanas geradas.'),
  weeklyPlans: z.array(WeeklyPlanSchema).describe('Planos semanais.'),
});

export type GenerateTrainingBlockOutput = z.infer<typeof GenerateTrainingBlockOutputSchema>;

export async function generateTrainingBlock(input: GenerateTrainingBlockInput): Promise<GenerateTrainingBlockOutput> {
  const aiInstance = getAiWithKey(input.apiKey);

  const { output } = await aiInstance.generate({
    system: `Você é um treinador de corrida de elite. 
    REGRAS OBRIGATÓRIAS:
    1. O primeiro dia da semana é SEMPRE Domingo.
    2. Responda rigorosamente em PORTUGUÊS (Brasil).
    3. Use o esquema JSON fornecido.
    4. Se houver um arquivo de referência, ele é sua fonte primária de verdade para ritmos.`,
    prompt: [
      { text: `Gere um plano de performance para: ${input.raceName || 'Performance Geral'}.
          
          Contexto:
          - Distância Alvo: ${input.targetRaceDistance} em ${input.raceDate}.
          - Objetivo: ${input.targetPace || input.targetTime || 'Melhor performance'}.
          - Volume Alvo: ${input.weeklyMileageGoal}km/semana.
          
          Fisiologia:
          - VDOT: ${input.currentVDOT}
          - Zonas FC: Z1:${input.hrZone1End}, Z2:${input.hrZone2End}, Z3:${input.hrZone3End}, Z4:${input.hrZone4End}. Máx:${input.hrMax}.
          
          Preferências:
          - Estratégia: ${input.planGenerationType === 'full' ? 'Ciclo Completo até a prova' : 'Bloco de 4 semanas'}.
          - Disponibilidade: ${input.weeklyAvailability}.
          - Leg Day: ${input.legDay} (Evite tiros no dia seguinte).
        `},
      ...(input.referenceFileDataUri ? [{ media: { url: input.referenceFileDataUri } }] : []),
      { text: 'Gere o plano garantindo que a semana comece no Domingo.' }
    ],
    output: { schema: GenerateTrainingBlockOutputSchema },
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
      ]
    }
  });

  if (!output) throw new Error('O motor de IA não retornou um plano válido. Tente novamente.');
  
  // Garante IDs únicos se a IA não gerou
  output.weeklyPlans.forEach(week => {
    week.runs.forEach(run => {
      if (!run.id) run.id = Math.random().toString(36).substring(7);
    });
  });

  return output;
}
