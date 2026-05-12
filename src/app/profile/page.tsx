"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Activity, 
  Utensils, 
  Dumbbell, 
  Save,
  ChevronRight,
  Info
} from "lucide-react";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold">Perfil do Atleta</h1>
            <p className="text-muted-foreground">Gerencie seus dados fisiológicos e métricas de desempenho.</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="mr-2 size-4" /> Salvar Alterações
          </Button>
        </header>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary rounded-xl p-1 h-12">
            <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent">
              <User className="mr-2 size-4 hidden md:block" /> Geral
            </TabsTrigger>
            <TabsTrigger value="running" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent">
              <Activity className="mr-2 size-4 hidden md:block" /> Corrida
            </TabsTrigger>
            <TabsTrigger value="diet" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent">
              <Utensils className="mr-2 size-4 hidden md:block" /> Dieta
            </TabsTrigger>
            <TabsTrigger value="strength" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent">
              <Dumbbell className="mr-2 size-4 hidden md:block" /> Força
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Informações Pessoais</CardTitle>
                <CardDescription>Dados fisiológicos essenciais para cálculos de base.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="João Silva" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input id="age" type="number" placeholder="28" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input id="weight" type="number" placeholder="72" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input id="height" type="number" placeholder="178" className="bg-secondary/50" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="running" className="mt-6 space-y-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Métricas de Performance (VDOT)</CardTitle>
                <CardDescription>Valores essenciais para calibração das zonas de treino.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    VO2 Max / VDOT
                    <Info className="ml-2 size-3 text-muted-foreground" />
                  </Label>
                  <Input defaultValue="54.2" className="bg-secondary/50 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Ritmo de Limiar (Pace T)</Label>
                  <Input defaultValue="4:12 min/km" className="bg-secondary/50 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>FC de Repouso (bpm)</Label>
                  <Input defaultValue="48" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>FC Máxima (bpm)</Label>
                  <Input defaultValue="188" className="bg-secondary/50" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diet" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Estratégia Nutricional</CardTitle>
                <CardDescription>Fase atual: Hipertrofia Limpa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50 text-center border">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Calorias Diárias</div>
                    <div className="text-xl font-bold font-headline">2.850</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 text-center border">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Proteína</div>
                    <div className="text-xl font-bold font-headline">165g</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 text-center border">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Carboidratos</div>
                    <div className="text-xl font-bold font-headline">380g</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strength" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Recordes de Força (PRs)</CardTitle>
                <CardDescription>Acompanhamento de movimentos compostos e explosivos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { lift: "Agachamento", weight: "110kg", date: "12 Out, 2024" },
                  { lift: "Levantamento Terra", weight: "145kg", date: "28 Set, 2024" },
                  { lift: "Barra Fixa com Carga", weight: "PC + 25kg", date: "05 Out, 2024" },
                ].map((item) => (
                  <div key={item.lift} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                        <Dumbbell className="size-5" />
                      </div>
                      <div>
                        <div className="font-bold">{item.lift}</div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-accent font-headline">{item.weight}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
