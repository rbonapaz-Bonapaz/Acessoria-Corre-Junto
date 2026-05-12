import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

/**
 * Retorna uma instância do Genkit configurada com uma chave de API específica,
 * ou a instância padrão caso nenhuma chave seja fornecida.
 */
export const getAiWithKey = (apiKey?: string) => {
  if (!apiKey) return ai;
  return genkit({
    plugins: [googleAI({apiKey})],
    model: 'googleai/gemini-2.5-flash',
  });
};
