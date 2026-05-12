
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Retorna uma instância do Genkit configurada com uma chave de API específica.
 * Utilizamos o modelo gemini-1.5-flash que é altamente estável.
 */
export const getAiWithKey = (apiKey?: string) => {
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-1.5-flash',
  });
};

/**
 * Instância padrão do Genkit.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
