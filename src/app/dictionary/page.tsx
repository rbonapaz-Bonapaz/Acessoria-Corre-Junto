"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  BookOpen, 
  Activity, 
  Zap, 
  Heart, 
  Dumbbell, 
  Milestone, 
  TrendingUp, 
  Target, 
  Clock 
} from "lucide-react";
import { cn } from "@/lib/utils";

const terms = [
  { term: "Rodagem (Easy Run)", category: "Treino", icon: Activity, def: "Treino de baixa intensidade para construir base aeróbica. O ritmo deve permitir conversa fluída sem perda de fôlego." },
  { term: "Longão (LSD)", category: "Treino", icon: Milestone, def: "Treino mais longo da semana. Foco no 'tempo de pé' e resistência mental, ensinando o corpo a usar gordura como combustível." },
  { term: "Intervalado (Tiros)", category: "Treino", icon: Zap, def: "Picos de esforço intenso seguidos de descanso. Melhora o VO2 Máx e a economia de corrida." },
  { term: "Tempo Run (Limiar)", category: "Treino", icon: TrendingUp, def: "Ritmo 'confortavelmente difícil'. Treina o corpo para lidar com o lactato e manter velocidade por mais tempo." },
  { term: "Regenerativo", category: "Treino", icon: Activity, def: "Trote extremamente leve após sessões intensas para ajudar na circulação sanguínea e recuperação muscular." },
  { term: "VDOT", category: "Fisiologia", icon: Target, def: "Método criado por Jack Daniels para medir a aptidão atual e prever ritmos de treino e prova baseados em resultados recentes." },
  { term: "Z2 - Zona Aeróbica", category: "Fisiologia", icon: Heart, def: "Intensidade de 60-70% da FC Máxima. Ideal para queima de gordura e fortalecimento do sistema cardiovascular." },
  { term: "Pace", category: "Estratégia", icon: Clock, def: "Ritmo médio expresso em minutos por quilômetro (min/km). É o inverso da velocidade horária (km/h)." },
  { term: "Split Negativo", category: "Estratégia", icon: TrendingUp, def: "Técnica de correr a segunda metade da prova mais rápida que a primeira. Evita fadiga precoce." },
  { term: "Taper (Polimento)", category: "Recuperação", icon: Dumbbell, def: "Redução do volume de treino nas semanas que antecedem uma prova alvo para chegar descansado." },
  { term: "Cadência", category: "Biomecânica", icon: Activity, def: "Número de passos por minuto (PPM). Uma cadência alta (aprox. 180) costuma reduzir o impacto." },
  { term: "Drop", category: "Equipamento", icon: Dumbbell, def: "Diferença de altura entre o calcanhar e a ponta do tênis. Influencia na ativação da panturrilha e tendão." },
];

export default function DictionaryPage() {
  const [search, setSearch] = React.useState("");

  const filteredTerms = terms.filter(t => 
    t.term.toLowerCase().includes(search.toLowerCase()) || 
    t.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="space-y-4">
          <h1 className="text-3xl font-headline font-bold">Dicionário do Corredor</h1>
          <p className="text-muted-foreground">Guia completo de termos técnicos, tipos de treinos e conceitos fisiológicos.</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar termo ou conceito..." 
              className="pl-12 h-14 bg-secondary/50 text-lg rounded-2xl border-border focus-visible:ring-accent"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="grid gap-4">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((item, i) => (
              <Card key={i} className="bg-card border-border hover:border-accent/30 transition-all group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <item.icon className="size-6" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-headline font-bold text-xl">{item.term}</h3>
                        <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-primary/30 text-[10px] uppercase tracking-wider">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.def}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed">
              <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">Nenhum termo encontrado</h3>
              <p className="text-sm text-muted-foreground">Tente pesquisar por palavras como 'Pace', 'Z2' ou 'Tiros'.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
