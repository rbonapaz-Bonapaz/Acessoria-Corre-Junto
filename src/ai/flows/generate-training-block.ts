
'use server';
/**
 * @fileOverview Fluxo Genkit para gerar blocos de treinamento personalizados.
 * Utiliza o Gemini 1.5 Flash para cálculos de VDOT e zonas de FC.
 */

import { getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTrainingBlockInputSchema = z.object({
  apiKey: z.string().optional().describe('Chave de API do usuário para processamento.'),
  raceName: z.string().optional().describe('Nome da prova alvo.'),
  currentVDOT: z.number().describe('Score VDOT/VO2 atual do atleta.'),
  hrZone1End: z.number().describe('Limite superior da Zona 1.'),
  hrZone2End: z.number().describe('Limite superior da Zona 2.'),
  hrZone3End: z.number().describe('Limite superior da Zona 2.'),
  hrZone4End: z.number().describe('Limite superior da Zona 4.'),
  hrMax: z.number().describe('Frequência cardíaca máxima.'),
  trainingBlockType: z.enum(['Base', 'Construction', 'Polishing']).describe('Fase atual do bloco de treinamento.'),
  planGenerationType: z.enum(['full', 'blocks']).describe('Se deve gerar 4 semanas ou o ciclo até a prova.'),
  raceDate: z.string().describe('Data da prova alvo no formato YYYY-MM-DD.'),
  weeklyMileageGoal: z.number().describe('Meta de volume semanal em quilômetros.'),
  targetRaceDistance: z.string().describe('Distância da prova (ex: 10k, 21k, 42k).'),
  targetPace: z.string().optional().describe('Pace alvo para a prova (min/km).'),
  targetTime: z.string().optional().describe('Tempo alvo para a prova (HH:MM:SS).'),
  currentLongRunDistance: z.number().describe('Distância atual do treino longo mais recente.'),
  weeklyAvailability: z.string().describe('Dias da semana disponíveis para treino.'),
  injuryHistory: z.string().describe('Histórico de lesões para moderação de carga.'),
  preferredWorkoutDays: z.string().describe('Dias preferidos para treinos de qualidade/tiros.'),
  legDay: z.string().optional().describe('Dia da semana reservado para treino de pernas na musculação.'),
  referenceFileDataUri: z.string().optional().describe('URI de dados de arquivo de referência (Foto de planilha física ou PDF).'),
});

export type GenerateTrainingBlockInput = z.infer<typeof GenerateTrainingBlockInputSchema>;

const WorkoutSchema = z.object({
  id: z.string().optional().describe('ID único'),
  day: z.string().describe('Dia da semana (Domingo, Segunda, Terça, Quarta, Quinta, Sexta, Sábado)'),
  type: z.string().describe('Tipo de treino (Rodagem, Intervalado, Longão, Tempo Run, OFF)'),
  distance: z.string().describe('Volume do treino (ex: 10km ou 45min)'),
  paceZone: z.string().describe('Zona de intensidade (Z1, Z2, Z3, Z4, Z5)'),
  description: z.string().describe('Descrição técnica detalhada da sessão.'),
});

const WeeklyPlanSchema = z.object({
  weekNumber: z.number().describe('Número da semana no bloco.'),
  focus: z.string().describe('Foco principal da semana.'),
  runs: z.array(WorkoutSchema).describe('Lista de treinos da semana iniciando no DOMINGO.'),
  strength: z.string().describe('Recomendações de fortalecimento específicas.'),
  notes: z.string().describe('Notas técnicas do treinador.'),
});

const GenerateTrainingBlockOutputSchema = z.object({
  blockType: z.string().describe('Descrição da fase do treinamento.'),
  durationWeeks: z.number().describe('Total de semanas geradas.'),
  weeklyPlans: z.array(WeeklyPlanSchema).describe('Planos semanais detalhados.'),
});

export type GenerateTrainingBlockOutput = z.infer<typeof GenerateTrainingBlockOutputSchema>;

export async function generateTrainingBlock(input: GenerateTrainingBlockInput): Promise<GenerateTrainingBlockOutput> {
  const aiInstance = getAiWithKey(input.apiKey);

  const { output } = await aiInstance.generate({
    model: 'googleai/gemini-1.5-flash',
    system: `Você é um treinador de corrida de elite e especialista em performance.
    REGRAS CRÍTICAS:
    1. A semana começa SEMPRE no DOMINGO.
    2. A resposta deve ser rigorosamente em PORTUGUÊS (Brasil).
    3. Use o esquema JSON fornecido.
    4. Se houver um arquivo de referência, PRIORIZE as informações contidas nele.
    5. Calcule ritmos baseados no VDOT de ${input.currentVDOT}.`,
    prompt: `Gere um plano de performance para "${input.raceName || 'Objetivo Alvo'}" (${input.targetRaceDistance}) em ${input.raceDate}.
    
    Contexto:
    - VDOT: ${input.currentVDOT}.
    - Volume: ${input.weeklyMileageGoal}km.
    - Disponibilidade: ${input.weeklyAvailability}.
    - Fisiologia (Zonas FC): Z1 até ${input.hrZone1End}, Z2 até ${input.hrZone2End}, Z3 até ${input.hrZone3End}, Z4 até ${input.hrZone4End}.`,
    output: { schema: GenerateTrainingBlockOutputSchema },
    config: {
      temperature: 0.7,
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    }
  });

  if (!output) throw new Error('Falha ao gerar o plano com o Gemini 1.5 Flash.');
  
  const order = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  output.weeklyPlans.forEach(week => {
    week.runs.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
    week.runs.forEach(run => {
      if (!run.id) run.id = Math.random().toString(36).substring(2, 11);
    });
  });

  return output;
}
