
'use server';
/**
 * @fileOverview Um treinador de IA conversacional que fornece feedback personalizado e recomendações para corredores.
 */

import { ai, getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const ChatWithAICoachInputSchema = z.object({
  apiKey: z.string().optional().describe('A chave de API do usuário para o processamento.'),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.string(),
    })
  ).describe('O histórico da conversa.'),
  workoutHistory: z.string().describe('Desempenho recente.'),
  trainingPlan: z.string().describe('Plano atual.'),
  imageDataUri: z.string().optional().describe('Imagem anexada.'),
});

export type ChatWithAICoachInput = z.infer<typeof ChatWithAICoachInputSchema>;

const ChatWithAICoachOutputSchema = z.object({
  feedback: z.string().describe('Feedback personalizado do treinador.'),
});

export type ChatWithAICoachOutput = z.infer<typeof ChatWithAICoachOutputSchema>;

export async function chatWithAICoach(input: ChatWithAICoachInput): Promise<ChatWithAICoachOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  
  const historyString = input.conversationHistory
    .map(m => `${m.role === 'user' ? 'Corredor' : 'Treinador'}: ${m.parts}`)
    .join('\n');

  const { output } = await aiInstance.generate({
    model: 'googleai/gemini-1.5-flash',
    system: 'Você é um treinador de corrida especialista chamado Gemini. Forneça feedback personalizado em PORTUGUÊS (Brasil). Seja encorajador e técnico.',
    prompt: [
      { text: `Histórico da Conversa:\n${historyString}` },
      { text: `Desempenho Recente:\n${input.workoutHistory}` },
      { text: `Plano Atual:\n${input.trainingPlan}` },
      ...(input.imageDataUri ? [{ media: { url: input.imageDataUri } }] : []),
      { text: 'Com base nestas informações, forneça seu feedback e recomendações.' }
    ],
    output: { schema: ChatWithAICoachOutputSchema }
  });

  if (!output) throw new Error('Falha ao obter resposta do Coach.');
  return output;
}
