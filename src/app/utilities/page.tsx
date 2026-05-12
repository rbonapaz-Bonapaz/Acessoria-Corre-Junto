"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Droplets, BookOpen, Clock, Zap } from "lucide-react";

export default function UtilitiesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-headline font-bold">Suíte de Suporte e Utilitários</h1>
          <p className="text-muted-foreground">Ferramentas especializadas para estratégia, hidratação e terminologia técnica.</p>
        </header>

        <Tabs defaultValue="pace" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary rounded-xl p-1 h-12">
            <TabsTrigger value="pace" className="rounded-lg">
              <Calculator className="mr-2 size-4" /> Calc Ritmo
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="rounded-lg">
              <Droplets className="mr-2 size-4" /> Nutrição
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="rounded-lg">
              <BookOpen className="mr-2 size-4" /> Dicionário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pace" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Preditor de Prova e Divisão de Ritmo</CardTitle>
                <CardDescription>Calcule seus splits com base no tempo alvo e distância.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Distância</Label>
                    <Input defaultValue="Maratona" className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo Alvo</Label>
                    <Input defaultValue="3:15:00" className="bg-secondary/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Input defaultValue="km" className="bg-secondary/50" />
                  </div>
                </div>

                <div className="rounded-2xl border bg-secondary/20 p-6 overflow-hidden">
                  <h4 className="font-headline font-bold mb-4 flex items-center gap-2">
                    <Clock className="size-4 text-accent" /> Ritmo Recomendado: 4:37/km
                  </h4>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    {[5, 10, 15, 20, 25, 30, 35, 42.2].map(km => (
                      <div key={km} className="text-center space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{km}k</div>
                        <div className="text-xs font-mono font-bold">{(km * 4.6).toFixed(1)}m</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Estratégia de Abastecimento Intra-Prova</CardTitle>
                <CardDescription>Planejamento de hidratação e ingestão de carboidratos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Zap className="size-4 text-accent" /> Ingestão de Carbo
                    </h4>
                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Alvo por Hora</span>
                        <span className="font-bold">60-90g</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Géis Totais (Maratona)</span>
                        <span className="font-bold">6 - 8 unidades</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Intervalo de Consumo</span>
                        <span className="font-bold">A cada 35-45 min</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Droplets className="size-4 text-accent" /> Ingestão de Líquidos
                    </h4>
                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa Base</span>
                        <span className="font-bold">500-700ml / hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Alvo de Sódio</span>
                        <span className="font-bold">300-600mg / hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Suor</span>
                        <span className="font-bold text-accent">Moderada</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dictionary" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Dicionário do Corredor</CardTitle>
                <CardDescription>Termos científicos e abreviações atléticas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { term: "VDOT", def: "Método para calcular sua habilidade de corrida e ritmos de treino baseados em resultados de provas." },
                    { term: "Ritmo T", def: "Ritmo de Limiar (Threshold). A intensidade onde seu corpo limpa o lactato na mesma taxa que o produz." },
                    { term: "TCS", def: "Tempo de Contato com o Solo. Tempo que seu pé permanece no chão em cada passada." },
                    { term: "Supercompensação", def: "Período pós-treino onde a função treinada atinge uma capacidade maior que antes do treino." },
                  ].map(item => (
                    <div key={item.term} className="p-4 rounded-xl border bg-secondary/20 hover:border-accent/50 transition-colors">
                      <div className="font-bold font-headline text-accent">{item.term}</div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.def}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
