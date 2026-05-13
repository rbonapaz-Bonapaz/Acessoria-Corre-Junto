
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Instância padrão do Genkit.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

/**
 * Retorna uma instância do Genkit configurada com uma chave de API específica.
 * Essencial para permitir que atletas usem suas próprias chaves.
 */
export const getAiWithKey = (apiKey?: string) => {
  if (!apiKey || apiKey.trim() === "") {
    return ai;
  }
  
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-1.5-flash',
  });
};
