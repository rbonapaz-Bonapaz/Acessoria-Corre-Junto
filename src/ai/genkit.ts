
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Retorna uma instância do Genkit configurada com uma chave de API específica.
 * Utilizamos o modelo gemini-1.5-flash que é altamente estável.
 */
export const getAiWithKey = (apiKey?: string) => {
  // Se a chave for uma string vazia ou undefined, inicializamos sem chave 
  // para deixar o plugin tentar buscar no ambiente ou falhar graciosamente.
  const config = apiKey && apiKey.trim() !== "" ? { apiKey } : {};
  
  return genkit({
    plugins: [googleAI(config)],
    model: 'googleai/gemini-1.5-flash',
  });
};

/**
 * Instância padrão do Genkit.
 * Protegida para não quebrar durante o build/SSR se a chave de ambiente estiver ausente.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
