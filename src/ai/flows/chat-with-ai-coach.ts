'use server';
/**
 * @fileOverview Treinador de IA conversacional para corredores.
 * Operando na versão v1 estável com o modelo Gemini 1.5 Flash.
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
    prompt: [
      { text: "INSTRUÇÃO DE SISTEMA: Você é o Gemini Coach, um treinador de corrida de elite operando na API v1 estável. Responda sempre em PORTUGUÊS (Brasil). Use seu conhecimento técnico para ajustar treinos com base em biometria e biomecânica." },
      { text: `Histórico da Conversa:\n${historyString}` },
      { text: `Desempenho Recente:\n${input.workoutHistory}` },
      { text: `Plano de Treino Atual:\n${input.trainingPlan}` },
      ...(input.imageDataUri ? [{ media: { url: input.imageDataUri } }] : []),
      { text: 'Com base nos dados fornecidos, dê seu feedback técnico e motivacional.' }
    ],
    output: { schema: ChatWithAICoachOutputSchema },
    config: {
      temperature: 0.7,
    }
  });

  if (!output) throw new Error('Falha ao obter resposta do treinador na API v1.');
  return output;
}
