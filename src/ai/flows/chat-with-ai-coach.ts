'use server';
/**
 * @fileOverview Um treinador de IA conversacional que fornece feedback personalizado e recomendações para corredores.
 *
 * - chatWithAICoach - Função que lida com a interação com o treinador de IA.
 * - ChatWithAICoachInput - O tipo de entrada para a função chatWithAICoach.
 * - ChatWithAICoachOutput - O tipo de retorno para a função chatWithAICoach.
 */

import {ai, getAiWithKey} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithAICoachInputSchema = z.object({
  apiKey: z.string().optional().describe('A chave de API do usuário para o processamento.'),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.string(),
    })
  ).describe('O histórico da conversa entre o usuário e o treinador de IA.'),
  workoutHistory: z.string().describe('Um resumo ou dados brutos do desempenho recente do corredor.'),
  trainingPlan: z.string().describe('Detalhes do plano de treinamento atual do corredor.'),
  imageDataUri: z.string().optional().describe('Uma imagem anexada pelo usuário em formato Data URI.'),
});
export type ChatWithAICoachInput = z.infer<typeof ChatWithAICoachInputSchema>;

const ChatWithAICoachOutputSchema = z.object({
  feedback: z.string().describe('Feedback personalizado e recomendações do treinador de corrida IA baseados no histórico, desempenho e plano.'),
});
export type ChatWithAICoachOutput = z.infer<typeof ChatWithAICoachOutputSchema>;

const chatWithAICoachPrompt = ai.definePrompt({
  name: 'chatWithAICoachPrompt',
  input: {schema: ChatWithAICoachInputSchema},
  output: {schema: ChatWithAICoachOutputSchema},
  prompt: `Você é um treinador de corrida especialista chamado Gemini. Seu objetivo é fornecer feedback personalizado e acionável para um corredor com base em seus treinos recentes e plano atual.

Sempre responda em PORTUGUÊS (Brasil).
Analise o histórico de treinos e o plano fornecido para oferecer insights. Mantenha um tom encorajador e profissional.
Considere o histórico da conversa para manter a fluidez.

Se o usuário enviar uma imagem (como um print de treino ou foto de tênis), analise o conteúdo visual para complementar sua orientação.

Histórico da Conversa:
{{#each conversationHistory}}
{{this.role}}: {{this.parts}}
{{/each}}

Desempenho Recente:
{{{workoutHistory}}}

Plano de Treinamento Atual:
{{{trainingPlan}}}

Anexo do Usuário:
{{#if imageDataUri}}{{media url=imageDataUri}}{{else}}Nenhum anexo visual.{{/if}}

Com base nestas informações, forneça seu feedback e recomendações personalizadas em português.
`,
});

const chatWithAICoachFlow = ai.defineFlow(
  {
    name: 'chatWithAICoachFlow',
    inputSchema: ChatWithAICoachInputSchema,
    outputSchema: ChatWithAICoachOutputSchema,
  },
  async (input) => {
    const aiInstance = getAiWithKey(input.apiKey);
    const {output} = await aiInstance.generate({
      prompt: 'chatWithAICoachPrompt',
      input: input,
    });
    return output!;
  }
);

export async function chatWithAICoach(input: ChatWithAICoachInput): Promise<ChatWithAICoachOutput> {
  return chatWithAICoachFlow(input);
}
