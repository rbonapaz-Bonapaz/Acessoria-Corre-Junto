
"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Activity, 
  MessageSquare, 
  Target, 
  Heart, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
        {/* Grid de Funcionalidades Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/40 border-border/50 p-8 hover:border-primary/30 transition-all group">
            <CardContent className="p-0 space-y-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Bot size={28} />
              </div>
              <h3 className="text-xl font-headline font-black uppercase italic text-white tracking-tight">
                Treinador Pessoal com Inteligência Artificial
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Esqueça as planilhas estáticas. O Gemini Coach cria um plano de treinamento periodizado que se adapta à sua rotina, metas e, principalmente, ao seu progresso real.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50 p-8 hover:border-primary/30 transition-all group">
            <CardContent className="p-0 space-y-4">
              <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-headline font-black uppercase italic text-white tracking-tight">
                Análise Biomecânica Avançada
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ao importar seus treinos via .fit ou .csv, nossa IA extrai dados como Razão da Passada e Eficiência de Corrida, fornecendo feedbacks que antes eram restritos a laboratórios de elite.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50 p-8 hover:border-primary/30 transition-all group">
            <CardContent className="p-0 space-y-4">
              <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-headline font-black uppercase italic text-white tracking-tight">
                Chat Contextual com o Coach
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Dúvida sobre um tiro? Cansaço excessivo? Converse com a IA que conhece todo o seu histórico. O coach responde com base nos seus dados reais e no seu plano atual.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50 p-8 hover:border-primary/30 transition-all group">
            <CardContent className="p-0 space-y-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-headline font-black uppercase italic text-white tracking-tight">
                Periodização Híbrida Inteligente
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Corrida, musculação e nutrição em um só lugar. O sistema equilibra seus treinos de força para que eles suportem sua corrida, sem gerar fadiga desnecessária.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção Diferencial */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl md:text-3xl font-headline font-black uppercase italic text-white">
            Por que o CorreJunto é diferente?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Nós combinamos ciência do esporte com a tecnologia de IA mais avançada do mundo para entregar uma experiência personalizada de verdade.
          </p>
        </div>

        {/* Grid de Destaques Secundários */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="text-center space-y-3">
            <div className="flex justify-center text-primary"><Heart size={32} /></div>
            <h4 className="font-headline font-bold text-white uppercase italic">Dados Fisiológicos Reais</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Usamos a lógica VDOT de Jack Daniels e FC de Limiar para calcular zonas de treino cirúrgicas.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="flex justify-center text-accent"><ShieldCheck size={32} /></div>
            <h4 className="font-headline font-bold text-white uppercase italic">Prevenção de Lesões</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O sistema monitora sua carga de treino (Training Load) e sugere descanso quando o corpo pede.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="flex justify-center text-yellow-500"><Zap size={32} /></div>
            <h4 className="font-headline font-bold text-white uppercase italic">Integração Total</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Conecte com Strava para importar dados e use nossas calculadoras técnicas para o dia da prova.
            </p>
          </div>
        </div>

        {/* Banner Final de Conversão */}
        <div className="relative overflow-hidden rounded-[2rem] bg-accent p-8 md:p-16 text-black text-center space-y-6 shadow-2xl shadow-accent/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={200} />
          </div>
          <div className="absolute bottom-0 left-0 p-4 opacity-10">
            <Zap size={150} />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-headline font-black uppercase italic tracking-tighter leading-none">
            PRONTO PARA O SEU NOVO RP?
          </h2>
          <p className="text-sm md:text-lg font-bold max-w-xl mx-auto leading-tight">
            Junte-se a centenas de atletas que já estão treinando de forma inteligente. Comece seu trial de 90 dias hoje mesmo.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="bg-black text-white hover:bg-black/80 font-black uppercase tracking-widest px-10 h-14 rounded-full text-sm shadow-xl">
              <Link href="/profile">CRIAR MEU PERFIL AGORA <ArrowRight className="ml-2 size-5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
