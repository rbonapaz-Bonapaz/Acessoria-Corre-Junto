'use server';
/**
 * @fileOverview Fluxo Genkit para gerar blocos de treinamento personalizados.
 * Operando na versão v1 estável com o modelo Gemini 1.5 Flash.
 */

import { getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTrainingBlockInputSchema = z.object({
  apiKey: z.string().optional().describe('Chave de API do usuário para processamento.'),
  raceName: z.string().optional().describe('Nome da prova alvo.'),
  currentVDOT: z.number().describe('Score VDOT/VO2 atual do atleta.'),
  hrZone1End: z.number().describe('Limite superior da Zona 1.'),
  hrZone2End: z.number().describe('Limite superior da Zona 2.'),
  hrZone3End: z.number().describe('Limite superior da Zona 3.'),
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
  referenceFileDataUri: z.string().optional().describe('URI de dados de arquivo de referência.'),
});

export type GenerateTrainingBlockInput = z.infer<typeof GenerateTrainingBlockInputSchema>;

const GenerateTrainingBlockOutputSchema = z.object({
  blockType: z.string(),
  durationWeeks: z.number(),
  weeklyPlans: z.array(z.object({
    weekNumber: z.number(),
    focus: z.string(),
    runs: z.array(z.object({
      id: z.string().optional(),
      day: z.string(),
      type: z.string(),
      distance: z.string(),
      paceZone: z.string(),
      description: z.string(),
    })),
    strength: z.string(),
    notes: z.string(),
  })),
});

export type GenerateTrainingBlockOutput = z.infer<typeof GenerateTrainingBlockOutputSchema>;

export async function generateTrainingBlock(input: GenerateTrainingBlockInput): Promise<GenerateTrainingBlockOutput> {
  const aiInstance = getAiWithKey(input.apiKey);

  // Na API v1 estável, evitamos campos automáticos que geram erros 400 (responseMimeType)
  // Usamos prompt direto e parsing manual para máxima estabilidade.
  const { text } = await aiInstance.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: [
      { text: `SISTEMA: Você é um treinador de corrida de elite e especialista em performance operando na versão v1 estável. 
      Responda APENAS com um objeto JSON válido, sem comentários ou texto adicional.
      
      REGRAS TÉCNICAS:
      1. Use VDOT ${input.currentVDOT} para prescrever ritmos.
      2. Meta: ${input.weeklyMileageGoal}km semanais.
      3. Prova: ${input.raceName || 'Objetivo'} (${input.targetRaceDistance}) em ${input.raceDate}.
      4. Disponibilidade: ${input.weeklyAvailability}.
      5. Zonas de FC: Z1<${input.hrZone1End}, Z2<${input.hrZone2End}, Z3<${input.hrZone3End}, Z4<${input.hrZone4End}.
      6. Evite treinos intensos após o Leg Day (${input.legDay || 'Não definido'}).
      7. Semana começa no DOMINGO.
      
      ESTRUTURA JSON OBRIGATÓRIA:
      {
        "blockType": "string",
        "durationWeeks": number,
        "weeklyPlans": [
          {
            "weekNumber": number,
            "focus": "string",
            "runs": [
              { "day": "string", "type": "string", "distance": "string", "paceZone": "string", "description": "string" }
            ],
            "strength": "string",
            "notes": "string"
          }
        ]
      }
      
      Gere agora o plano completo baseado nos dados acima.` },
      ...(input.referenceFileDataUri ? [{ media: { url: input.referenceFileDataUri } }] : [])
    ],
    config: { temperature: 0.3 }
  });

  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const output = JSON.parse(cleanText) as GenerateTrainingBlockOutput;
    
    const order = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    output.weeklyPlans.forEach(week => {
      week.runs.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
      week.runs.forEach(run => {
        if (!run.id) run.id = Math.random().toString(36).substring(2, 11);
      });
    });
    return output;
  } catch (e) {
    console.error("Erro ao processar JSON da IA v1:", text);
    throw new Error('Falha na estrutura de dados da IA (API v1). Tente novamente.');
  }
}
