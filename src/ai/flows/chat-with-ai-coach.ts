'use server';
/**
 * @fileOverview Treinador de IA conversacional para corredores.
 * Operando na versão v1 estável com o modelo Gemini 1.5 Flash.
 */

import { getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const ChatWithAICoachInputSchema = z.object({
  apiKey: z.string().optional().describe('A chave de API do usuário.'),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.string(),
    })
  ).describe('Histórico.'),
  workoutHistory: z.string().describe('Desempenho.'),
  trainingPlan: z.string().describe('Plano.'),
  imageDataUri: z.string().optional().describe('Imagem.'),
});

export type ChatWithAICoachInput = z.infer<typeof ChatWithAICoachInputSchema>;

export async function chatWithAICoach(input: ChatWithAICoachInput): Promise<{ feedback: string }> {
  const aiInstance = getAiWithKey(input.apiKey);
  
  const historyString = input.conversationHistory
    .map(m => `${m.role === 'user' ? 'Atleta' : 'Coach'}: ${m.parts}`)
    .join('\n');

  const { text } = await aiInstance.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: [
      { text: "SISTEMA: Você é o Gemini Coach. Responda sempre em PORTUGUÊS (Brasil). Seja técnico e motivador." },
      { text: `Histórico:\n${historyString}\n\nDesempenho:\n${input.workoutHistory}\n\nPlano:\n${input.trainingPlan}` },
      ...(input.imageDataUri ? [{ media: { url: input.imageDataUri } }] : []),
      { text: "Com base nos dados, dê seu feedback." }
    ],
    config: { temperature: 0.7 }
  });

  return { feedback: text };
}
