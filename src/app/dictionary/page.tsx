"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Activity, 
  Heart, 
  Info, 
  Brain,
  Zap,
  TrendingUp,
  Target,
  Clock,
  Dumbbell,
  Milestone
} from "lucide-react";
import { cn } from "@/lib/utils";

const trainingTerms = [
  { term: "RODAGEM (EASY RUN)", def: "É o \"arroz com feijão\" do treino. O objetivo é construir sua base aeróbica (seu motor). O ritmo deve ser leve o suficiente para você conseguir conversar normalmente. Ajuda a fortalecer articulações e queimar gordura de forma eficiente." },
  { term: "LONGÃO (LSD)", def: "O treino mais longo da semana. Foco no \"tempo de pé\". Ensina o corpo a oxidar gordura como combustível e prepara a mente para distâncias maiores e fadiga acumulada." },
  { term: "INTERVALADO (TIROS)", def: "Picos de esforço intenso (VO2 Máx) seguidos por descanso. É o treino que aumenta sua velocidade máxima e melhora a eficiência cardiovascular. Exige alta carga metabólica." },
  { term: "TEMPO RUN (LIMIAR)", def: "Ritmo \"confortavelmente difícil\". Intensidade mantida no limiar de lactato (L2). Ensina o corpo a remover o lactato do sangue enquanto corre em velocidade firme." },
  { term: "REGENERATIVO", def: "Corrida extremamente leve (Z1) para ajudar na circulação e recuperação muscular após sessões intensas. Se houver qualquer esforço, está rápido demais." },
  { term: "FARTLEK", def: "Do sueco \"brincar de correr\". Alternar ritmos usando o ambiente como referência, sem a pressão de tempos fixos. Excelente para desenvolver percepção de esforço (RPE)." },
  { term: "SUBIDAS (HILL REPEATS)", def: "A musculação específica do corredor. Melhora a potência mecânica, a postura de corrida e previne lesões por fortalecer a cadeia posterior." },
  { term: "PROGRESSIVO", def: "Treino que começa em ritmo leve e termina em ritmo de prova ou superior. Ótimo para controle de pacing e simulação de final de prova." },
  { term: "DESCANSO (OFF)", def: "O treino mais importante. O momento em que o corpo absorve o estímulo e reconstrói as fibras musculares (Supercompensação). Sem descanso, não há evolução." },
];

export default function DictionaryPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="space-y-2 px-2">
          <h1 className="text-3xl md:text-5xl font-headline font-black uppercase italic tracking-tighter">
            <span className="text-white">DICIONÁRIO DO</span> <span className="text-primary">CORREDOR</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">
            Seu guia completo de termos, treinos e conceitos da corrida de alta performance.
          </p>
        </header>

        <Tabs defaultValue="treinos" className="w-full">
          <div className="px-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-secondary/20 p-1.5 rounded-xl h-auto gap-2">
              <TabsTrigger value="treinos" className="py-3 font-black text-[10px] md:text-xs uppercase italic gap-2">
                <Activity className="size-4 text-primary" /> Treinos
              </TabsTrigger>
              <TabsTrigger value="zonas" className="py-3 font-black text-[10px] md:text-xs uppercase italic gap-2">
                <Heart className="size-4" /> Zonas FC
              </TabsTrigger>
              <TabsTrigger value="guia" className="py-3 font-black text-[10px] md:text-xs uppercase italic gap-2">
                <Info className="size-4" /> Guia da Calc.
              </TabsTrigger>
              <TabsTrigger value="conceitos" className="py-3 font-black text-[10px] md:text-xs uppercase italic gap-2">
                <Brain className="size-4" /> Conceitos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="treinos" className="mt-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-2">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-headline font-black uppercase italic text-white">Tipos de Treinamento</h2>
              <p className="text-muted-foreground text-xs md:text-sm italic">A finalidade técnica de cada sessão na sua planilha periodizada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingTerms.map((item, i) => (
                <Card key={i} className="bg-card/40 border-border/50 hover:border-primary/30 transition-all group shadow-lg">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="font-headline font-black text-primary italic text-sm md:text-base tracking-tight uppercase">
                      {item.term}
                    </h3>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-medium">
                      {item.def}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="zonas" className="mt-8 px-2 animate-in fade-in">
             <div className="space-y-1 mb-8">
              <h2 className="text-xl md:text-2xl font-headline font-black uppercase italic text-white">Zonas de Intensidade</h2>
              <p className="text-muted-foreground text-xs md:text-sm italic">Como o corpo responde a cada faixa de batimento cardíaco.</p>
            </div>
            <div className="grid gap-4">
               {[
                 { z: "Z1", label: "RECUPERAÇÃO", color: "text-blue-400", desc: "Esforço muito leve para regeneração ativa." },
                 { z: "Z2", label: "RESISTÊNCIA AERÓBICA", color: "text-green-400", desc: "O motor da base. Melhora a economia e queima gordura." },
                 { z: "Z3", label: "POTÊNCIA AERÓBICA", color: "text-yellow-400", desc: "Ritmo de maratona. Melhora a capilarização muscular." },
                 { z: "Z4", label: "LIMIAR DE LACTATO", color: "text-orange-400", desc: "O ponto crítico. Melhora a velocidade sustentável." },
                 { z: "Z5", label: "VO2 MÁXIMO", color: "text-red-400", desc: "Limite absoluto. Melhora a potência e o fôlego." },
               ].map((item, i) => (
                 <Card key={i} className="bg-card/40 border-border/50">
                   <CardContent className="p-5 flex items-start gap-4">
                     <span className={cn("text-2xl font-black italic shrink-0 w-12", item.color)}>{item.z}</span>
                     <div className="space-y-1">
                       <h4 className="font-black italic text-xs uppercase text-white">{item.label}</h4>
                       <p className="text-muted-foreground text-xs">{item.desc}</p>
                     </div>
                   </CardContent>
                 </Card>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="guia" className="mt-8 px-2 animate-in fade-in">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-headline font-black uppercase italic text-white">Como usar a Calculadora</h2>
                <p className="text-muted-foreground text-xs md:text-sm italic">Entenda as ferramentas de planejamento do app.</p>
              </div>
              <div className="grid gap-6">
                <div className="flex gap-4">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Target className="size-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black italic text-sm text-white uppercase tracking-tight">Cálculo de Pace</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Insira sua distância e tempo alvo para saber exatamente a velocidade média que deve manter por quilômetro.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <TrendingUp className="size-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black italic text-sm text-white uppercase tracking-tight">Estratégia de Splits</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Determine se sua prova será com Split Negativo (acelerando no fim) ou Constante para evitar a quebra.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conceitos" className="mt-8 px-2 animate-in fade-in">
            <div className="space-y-1 mb-8">
              <h2 className="text-xl md:text-2xl font-headline font-black uppercase italic text-white">Conceitos Fisiológicos</h2>
              <p className="text-muted-foreground text-xs md:text-sm italic">A ciência por trás do desempenho atlético.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[
                 { title: "VO2 MÁX", icon: Zap, desc: "A capacidade máxima do seu corpo de captar e usar oxigênio." },
                 { title: "VDOT", icon: Target, desc: "Fórmula de Jack Daniels que estima seu potencial de corrida." },
                 { title: "TAPER", icon: Dumbbell, desc: "Redução de volume antes da prova para recuperar o corpo." },
                 { title: "CADÊNCIA", icon: Activity, desc: "Número de passos por minuto. O ideal gira em torno de 180." },
                 { title: "DROP", icon: Milestone, desc: "Diferença de altura entre o calcanhar e a ponta do tênis." },
                 { title: "LIMIAR", icon: Clock, desc: "Ponto onde o corpo acumula mais lactato do que consegue remover." },
               ].map((item, i) => (
                 <Card key={i} className="bg-card/40 border-border/50 text-center group hover:bg-primary/5 transition-colors">
                   <CardContent className="p-8 space-y-4 flex flex-col items-center">
                     <item.icon className="size-8 text-primary group-hover:scale-110 transition-transform" />
                     <h4 className="font-black italic text-white uppercase tracking-tight">{item.title}</h4>
                     <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                   </CardContent>
                 </Card>
               ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
