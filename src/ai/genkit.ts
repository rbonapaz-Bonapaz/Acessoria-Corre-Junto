import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Chave de API de fallback para o laboratório CorreJunto.
 */
const DEFAULT_KEY = "AIzaSyDPO6BpCQC9jHhuavasgY2OhkJvleHL8v0";

/**
 * Resolve a chave de API com base na prioridade: 
 * 1. Chave injetada manualmente pelo usuário no App
 * 2. GEMINI_API_KEY (Vercel/Firebase Env)
 * 3. NEXT_PUBLIC_GEMINI_API_KEY
 * 4. Fallback fixo
 */
const getEffectiveKey = (userKey?: string) => {
  if (userKey && userKey.trim() !== "" && userKey.startsWith("AIza")) {
    return userKey.trim();
  }
  
  const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envKey && envKey.startsWith("AIza")) {
    return envKey;
  }
  
  return DEFAULT_KEY;
};

/**
 * Retorna uma instância configurada do Genkit.
 * Utilizamos googleAI sem versão explícita para permitir que o SDK escolha 
 * a rota mais estável compatível com o modelo gemini-1.5-flash.
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
