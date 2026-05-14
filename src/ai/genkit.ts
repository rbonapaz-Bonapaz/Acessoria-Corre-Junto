
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Chave de API de fallback para o laboratório CorreJunto.
 * Recomenda-se que o atleta use sua própria chave configurada no menu lateral.
 */
const DEFAULT_KEY = "AIzaSyDPO6BpCQC9jHhuavasgY2OhkJvleHL8v0";

/**
 * Resolve a chave de API com base na prioridade: Chave do usuário > ENV > Fallback.
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
 * Retorna uma instância configurada do Genkit.
 * Utilizamos o Gemini 2.0 Flash por ser a versão de nova geração mais estável e potente.
 */
export const getAiWithKey = (userApiKey?: string) => {
  const apiKey = getEffectiveKey(userApiKey);
  
  return genkit({
    plugins: [
      googleAI({ 
        apiKey 
      })
    ],
  });
};

/**
 * Instância padrão do Genkit para o sistema.
 */
export const ai = getAiWithKey();
