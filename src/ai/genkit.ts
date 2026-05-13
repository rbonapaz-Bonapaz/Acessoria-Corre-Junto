import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Instância padrão do Genkit.
 * Tenta usar a chave de ambiente do servidor como fallback.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

/**
 * Retorna uma instância do Genkit configurada com uma chave de API específica.
 * Essencial para permitir que atletas usem suas próprias chaves ou a do treinador (fallback).
 */
export const getAiWithKey = (userApiKey?: string) => {
  // Se o usuário forneceu uma chave, usa ela. 
  // Caso contrário, o Genkit usará a GOOGLE_GENAI_API_KEY definida no ambiente.
  if (userApiKey && userApiKey.trim() !== "") {
    return genkit({
      plugins: [googleAI({ apiKey: userApiKey })],
      model: 'googleai/gemini-1.5-flash',
    });
  }
  
  return ai;
};
