
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Instância padrão do Genkit.
 * Utiliza a chave definida no .env (GOOGLE_GENAI_API_KEY) como fallback global.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

/**
 * Retorna uma instância do Genkit configurada com uma chave de API específica.
 * Essencial para permitir que atletas usem suas próprias chaves ou a do servidor (fallback).
 */
export const getAiWithKey = (userApiKey?: string) => {
  // Se o usuário forneceu uma chave válida, usa ela.
  if (userApiKey && userApiKey.trim() !== "" && userApiKey.startsWith("AIza")) {
    return genkit({
      plugins: [googleAI({ apiKey: userApiKey })],
      model: 'googleai/gemini-1.5-flash',
    });
  }
  
  // Caso contrário, retorna a instância padrão que já possui a chave do .env
  return ai;
};
