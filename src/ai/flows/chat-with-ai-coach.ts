'use server';
/**
 * @fileOverview Treinador de IA conversacional para corredores.
 * Utiliza o Gemini 1.5 Flash na versão v1 estável para feedback técnico.
 */

import { getAiWithKey } from '@/ai/genkit';
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
    system: 'Você é o Gemini Coach, um treinador de corrida de elite operando na API v1 estável. Responda em PORTUGUÊS.',
    prompt: [
      { text: `Histórico:\n${historyString}` },
      { text: `Desempenho:\n${input.workoutHistory}` },
      { text: `Plano:\n${input.trainingPlan}` },
      ...(input.imageDataUri ? [{ media: { url: input.imageDataUri } }] : []),
      { text: 'Com base na biometria v1, forneça seu feedback técnico de alto nível.' }
    ],
    output: { schema: ChatWithAICoachOutputSchema },
    config: {
      temperature: 0.7,
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    }
  });

  if (!output) throw new Error('Falha ao obter resposta do motor de IA v1 estável.');
  return output;
}
