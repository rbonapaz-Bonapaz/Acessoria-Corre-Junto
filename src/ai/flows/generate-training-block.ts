
'use server';
/**
 * @fileOverview Um fluxo Genkit para gerar blocos de treinamento personalizados ou ciclos completos.
 *
 * - generateTrainingBlock - Função que lida com o processo de geração do plano de treino.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTrainingBlockInputSchema = z.object({
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
  return generateTrainingBlockFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrainingBlockPrompt',
  input: { schema: GenerateTrainingBlockInputSchema },
  output: { schema: GenerateTrainingBlockOutputSchema },
  prompt: `Você é um treinador de corrida de elite. Gere um plano de treinamento em PORTUGUÊS.

{{#if raceName}}O atleta está se preparando para a prova: {{{raceName}}}.{{/if}}

Estratégia: {{planGenerationType}} (full = até a data da prova {{raceDate}}; blocks = apenas as próximas 4 semanas).
Perfil do Atleta:
- VDOT: {{currentVDOT}}
- Zonas FC: Z1 ate {{hrZone1End}}, Z2 ate {{hrZone2End}}, Z3 ate {{hrZone3End}}, Z4 ate {{hrZone4End}}. Max: {{hrMax}}.
- Alvo: {{targetRaceDistance}} em {{raceDate}}.
- Objetivo de Performance: {{#if targetPace}}Pace Alvo de {{targetPace}} min/km{{else if targetTime}}Tempo Alvo de {{targetTime}}{{else}}Melhorar desempenho geral{{/if}}.
- Volume Alvo: {{weeklyMileageGoal}}km/semana.
- Leg Day: {{legDay}} (NÃO agende Tiros ou Longões no dia seguinte a este dia).
- Disponibilidade: {{weeklyAvailability}}.

Se for "full", calcule quantas semanas faltam até {{raceDate}} e gere todas elas, respeitando as fases de Base, Construção e Polimento (Taper).
Se for "blocks", gere 4 semanas focadas em {{trainingBlockType}}.

O plano deve buscar a evolução pretendida para atingir o objetivo de performance (Pace ou Tempo) definido, respeitando a biometria atual (VDOT e Zonas).

Estruture rigorosamente conforme o JSON schema. Cada treino ('runs') deve ter um 'id' único (UUID ou string aleatória).`,
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
