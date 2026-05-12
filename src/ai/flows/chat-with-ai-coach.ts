'use server';
/**
 * @fileOverview A conversational AI coach that provides personalized feedback and recommendations to runners.
 *
 * - chatWithAICoach - A function that handles the AI coach interaction.
 * - ChatWithAICoachInput - The input type for the chatWithAICoach function.
 * - ChatWithAICoachOutput - The return type for the chatWithAICoach function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithAICoachInputSchema = z.object({
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.string(),
    })
  ).describe('The history of the conversation between the user and the AI coach.'),
  workoutHistory: z.string().describe('A summary or raw data of the runner\'s recent workout performance, which can be pasted directly.'),
  trainingPlan: z.string().describe('The runner\'s current training plan details, which can be pasted directly.'),
});
export type ChatWithAICoachInput = z.infer<typeof ChatWithAICoachInputSchema>;

const ChatWithAICoachOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback and recommendations from the AI running coach based on the conversation history, workout performance, and training plan.'),
});
export type ChatWithAICoachOutput = z.infer<typeof ChatWithAICoachOutputSchema>;

const chatWithAICoachPrompt = ai.definePrompt({
  name: 'chatWithAICoachPrompt',
  input: {schema: ChatWithAICoachInputSchema},
  output: {schema: ChatWithAICoachOutputSchema},
  prompt: `You are an expert running coach named Gemini. Your goal is to provide personalized, actionable feedback and recommendations to a runner based on their recent workout performance and current training plan.

Analyze the provided workout history and training plan to offer insights. Maintain a helpful, encouraging, and knowledgeable tone.
Consider the conversation history to continue the dialogue naturally.

Conversation History:
{{#each conversationHistory}}
{{this.role}}: {{this.parts}}
{{/each}}

Recent Workout Performance:
{{{workoutHistory}}}

Current Training Plan:
{{{trainingPlan}}}

Based on this information, provide your personalized feedback and recommendations.
`,
});

const chatWithAICoachFlow = ai.defineFlow(
  {
    name: 'chatWithAICoachFlow',
    inputSchema: ChatWithAICoachInputSchema,
    outputSchema: ChatWithAICoachOutputSchema,
  },
  async (input) => {
    const {output} = await chatWithAICoachPrompt(input);
    return output!;
  }
);

export async function chatWithAICoach(input: ChatWithAICoachInput): Promise<ChatWithAICoachOutput> {
  return chatWithAICoachFlow(input);
}
