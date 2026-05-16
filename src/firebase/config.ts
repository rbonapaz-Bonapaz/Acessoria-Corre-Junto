'use client';

/**
 * Configuração do Firebase sincronizada com as variáveis de ambiente do Vercel.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCrYqGHDCEYwU8QXY34dZMbQ4tLKvAw_-w",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "estudio-1669701209.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "estudio-1669701209",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "estudio-1669701209.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "654958868324",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:654958868324:web:corre-junto"
};
