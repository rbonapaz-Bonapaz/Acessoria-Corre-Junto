import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Instância padrão do Genkit.
 * Utiliza o modelo estável Gemini 1.5 Flash.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

/**
 * Retorna uma instância do Genkit configurada com uma chave de API específica,
 * ou a instância padrão caso nenhuma chave seja fornecida.
 * O modelo gemini-1.5-flash é utilizado por ser estável e rápido.
 */
export const getAiWithKey = (apiKey?: string) => {
  if (!apiKey) return ai;
  return genkit({
    plugins: [googleAI({apiKey})],
    model: 'googleai/gemini-1.5-flash',
  });
};
