import type {Metadata} from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'CorreJunto - Performance Atlética Avançada',
  description: 'Periodização impulsionada por IA e análise de desempenho para atletas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
