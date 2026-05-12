'use server';
/**
 * @fileOverview Um fluxo Genkit para gerar blocos de treinamento personalizados ou ciclos completos.
 *
 * - generateTrainingBlock - Função que lida com o processo de geração do plano de treino.
 */

import { getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTrainingBlockInputSchema = z.object({
  apiKey: z.string().optional().describe('A chave de API do usuário para o processamento.'),
  raceName: z.string().optional().describe('Nome da prova alvo.'),
  currentVDOT: z.number().describe('Score VDOT atual.'),
  hrZone1End: z.number().describe('Frequência cardíaca ao final da Zona 1.'),
  hrZone2End: z.number().describe('Frequência cardíaca ao final da Zona 2.'),
  hrZone3End: z.number().describe('Frequência cardíaca ao final da Zona 3.'),
  hrZone4End: z.number().describe('Frequência cardíaca ao final da Zona 4.'),
  hrMax: z.number().describe('Frequência cardíaca máxima.'),
  trainingBlockType: z
    .enum(['Base', 'Construction', 'Polishing'])
    .describe('Tipo de bloco de treino (Base, Construção ou Polimento).'),
  planGenerationType: z.enum(['full', 'blocks']).describe('Estratégia de geração: 4 semanas ou ciclo até a prova.'),
  raceDate: z.string().describe('Data da prova alvo.'),
  weeklyMileageGoal: z.number().describe('Meta de volume semanal em km.'),
  targetRaceDistance: z.string().describe('Distância da prova alvo.'),
  targetPace: z.string().optional().describe('Pace alvo pretendido para a prova (min/km).'),
  targetTime: z.string().optional().describe('Tempo alvo pretendido para a prova (HH:MM:SS).'),
  currentLongRunDistance: z.number().describe('Distância atual do longão em km.'),
  weeklyAvailability: z.string().describe('Disponibilidade semanal.'),
  injuryHistory: z.string().describe('Histórico de lesões.'),
  preferredWorkoutDays: z.string().describe('Dias preferidos para treinos intensos.'),
  legDay: z.string().optional().describe('Dia de treino de perna (evitar intensidade no dia seguinte).'),
});

export type GenerateTrainingBlockInput = z.infer<typeof GenerateTrainingBlockInputSchema>;

const WeeklyPlanSchema = z.object({
  weekNumber: z.number().describe('Número da semana.'),
  focus: z.string().describe('Foco da semana.'),
  runs: z.array(
    z.object({
      id: z.string().describe('ID único do treino.'),
      day: z.string().describe('Dia da semana.'),
      type: z.string().describe('Tipo de treino.'),
      distance: z.string().describe('Distância.'),
      paceZone: z.string().describe('Zona de ritmo.'),
      description: z.string().describe('Descrição detalhada.'),
    })
  ),
  strength: z.string().describe('Recomendações de força.'),
  notes: z.string().describe('Notas gerais.'),
});

const GenerateTrainingBlockOutputSchema = z.object({
  blockType: z.string().describe('Descrição da fase gerada.'),
  durationWeeks: z.number().describe('Total de semanas geradas.'),
  weeklyPlans: z.array(WeeklyPlanSchema).describe('Lista de planos semanais.'),
});

export type GenerateTrainingBlockOutput = z.infer<typeof GenerateTrainingBlockOutputSchema>;

export async function generateTrainingBlock(input: GenerateTrainingBlockInput): Promise<GenerateTrainingBlockOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  
  const { output } = await aiInstance.generate({
    system: 'Você é um treinador de corrida de elite. Gere um plano de treinamento em PORTUGUÊS estruturado rigorosamente conforme o esquema de saída.',
    prompt: `
      Gere um plano para o atleta:
      ${input.raceName ? `Prova: ${input.raceName}` : ''}
      Estratégia: ${input.planGenerationType} (full = até ${input.raceDate}; blocks = 4 semanas).
      VDOT: ${input.currentVDOT}
      Zonas FC: Z1 ate ${input.hrZone1End}, Z2 ate ${input.hrZone2End}, Z3 ate ${input.hrZone3End}, Z4 ate ${input.hrZone4End}. Max: ${input.hrMax}.
      Alvo: ${input.targetRaceDistance} em ${input.raceDate}.
      Objetivo: ${input.targetPace ? `Pace ${input.targetPace} min/km` : input.targetTime ? `Tempo ${input.targetTime}` : 'Performance'}.
      Volume: ${input.weeklyMileageGoal}km/semana.
      Leg Day: ${input.legDay} (NÃO agende Tiros ou Longões no dia seguinte).
      Disponibilidade: ${input.weeklyAvailability}.

      Se for "full", calcule as semanas até ${input.raceDate}. Se for "blocks", gere 4 semanas de ${input.trainingBlockType}.
      Cada treino deve ter um 'id' único.
    `,
    output: { schema: GenerateTrainingBlockOutputSchema }
  });

  if (!output) throw new Error('Falha ao gerar o plano de treinamento.');
  return output;
}
