
import { EventEmitter } from 'events';

/**
 * Emissor de eventos centralizado para erros do Firebase.
 * Utilizado para capturar erros de permissão e exibir no overlay de desenvolvimento.
 */
export const errorEmitter = new EventEmitter();
