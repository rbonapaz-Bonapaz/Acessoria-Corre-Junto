'use server';
/**
 * @fileOverview Um fluxo Genkit para gerar blocos de treinamento personalizados ou ciclos completos, agora com suporte a arquivos de referência e contextualização da prova alvo.
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
  referenceFileDataUri: z.string().optional().describe('URI de dados de um PDF ou imagem com orientações anteriores ou planos a serem seguidos.'),
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
  if (!input.apiKey || input.apiKey.trim() === "") {
    throw new Error('Chave de API não configurada. Configure no menu lateral.');
  }

  const aiInstance = getAiWithKey(input.apiKey);
  
  try {
    const { output } = await aiInstance.generate({
      system: 'Você é um treinador de corrida de elite. Gere um plano de treinamento em PORTUGUÊS estruturado rigorosamente conforme o esquema de saída. Se houver um nome de prova alvo, use-o no seu tom para motivar o atleta. Se houver um arquivo de referência anexado (PDF ou imagem), use-o como a fonte primária de verdade para os ritmos e orientações específicas.',
      prompt: [
        { text: `Gere um plano de elite para o atleta focando em: ${input.raceName || 'Performance Geral'}.
          
          Contexto da Prova:
          - Prova: ${input.raceName || 'N/A'}
          - Alvo: ${input.targetRaceDistance} em ${input.raceDate}.
          - Objetivo: ${input.targetPace ? `Pace ${input.targetPace} min/km` : input.targetTime ? `Tempo ${input.targetTime}` : 'Melhor tempo possível'}.
          
          Fisiologia:
          - VDOT Atual: ${input.currentVDOT}
          - Zonas FC: Z1 ate ${input.hrZone1End}, Z2 ate ${input.hrZone2End}, Z3 ate ${input.hrZone3End}, Z4 ate ${input.hrZone4End}. Max: ${input.hrMax}.
          
          Restrições & Preferências:
          - Estratégia: ${input.planGenerationType} (full = ciclo completo; blocks = 4 semanas).
          - Volume Alvo: ${input.weeklyMileageGoal}km/semana.
          - Leg Day: ${input.legDay} (Evite Tiros ou Longões no dia seguinte).
          - Disponibilidade: ${input.weeklyAvailability}.
          - Histórico: ${input.injuryHistory}.
        `},
        ...(input.referenceFileDataUri ? [{ media: { url: input.referenceFileDataUri } }] : []),
        { text: 'Analise o arquivo anexado para extrair detalhes sobre treinos passados ou orientações específicas e incorpore-as ao novo ciclo. Use o nome da prova alvo na descrição dos focos semanais para criar conexão emocional.' }
      ],
      output: { schema: GenerateTrainingBlockOutputSchema }
    });

    if (!output) throw new Error('Falha ao gerar o plano de treinamento.');
    return output;
  } catch (err: any) {
    console.error("Erro no Fluxo de Geração:", err);
    throw new Error(err.message || 'Erro interno no motor de IA.');
  }
}
