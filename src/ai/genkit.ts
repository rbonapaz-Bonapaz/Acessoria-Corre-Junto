import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Chave de API fornecida pelo usuário para testes e fallback definitivo.
 */
const DEFAULT_KEY = "AIzaSyDPO6BpCQC9jHhuavasgY2OhkJvleHL8v0";

/**
 * Determina a chave de API mais apropriada a ser usada.
 * Prioridade: Chave do usuário > Variável de ambiente > Chave de fallback.
 */
const getEffectiveKey = (userKey?: string) => {
  if (userKey && userKey.trim() !== "" && userKey.startsWith("AIza")) {
    return userKey.trim();
  }
  if (process.env.GOOGLE_GENAI_API_KEY && process.env.GOOGLE_GENAI_API_KEY.startsWith("AIza")) {
    return process.env.GOOGLE_GENAI_API_KEY;
  }
  return DEFAULT_KEY;
};

/**
 * Retorna uma instância do Genkit configurada com a chave de API resolvida.
 * Utiliza o modelo gemini-2.0-flash para performance de próxima geração e estabilidade de cota.
 */
export const getAiWithKey = (userApiKey?: string) => {
  const apiKey = getEffectiveKey(userApiKey);
  
  return genkit({
    plugins: [
      googleAI({ 
        apiKey 
      })
    ],
    model: 'googleai/gemini-2.0-flash',
  });
};

/**
 * Instância padrão do Genkit (utiliza fallback ou ambiente).
 */
export const ai = getAiWithKey();
