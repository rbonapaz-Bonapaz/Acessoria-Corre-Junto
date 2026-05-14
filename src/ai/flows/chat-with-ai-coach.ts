'use server';
/**
 * @fileOverview Treinador de IA conversacional para corredores na API v1.
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
      { text: `SISTEMA: Você é o Gemini Coach operando na versão v1 estável.
      Responda em PORTUGUÊS (Brasil). Seja técnico, motivador e focado em performance.
      
      CONTEXTO DO ATLETA:
      Histórico: ${historyString}
      Desempenho Recente: ${input.workoutHistory}
      Plano Atual: ${input.trainingPlan}` },
      ...(input.imageDataUri ? [{ media: { url: input.imageDataUri } }] : []),
      { text: "Com base nos dados acima e no contexto da conversa, forneça seu feedback técnico agora." }
    ],
    config: { temperature: 0.7 }
  });

  return { feedback: text };
}
