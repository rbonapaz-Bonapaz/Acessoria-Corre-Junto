"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Droplets, 
  Heart, 
  Zap, 
  Lightbulb,
  Copy,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppContext } from "@/contexts/AppContext";

export default function CalculatorsPage() {
  const context = React.useContext(AppContext);
  const profile = context?.activeProfile;

  // --- Estados Hidratação ---
  const [weight, setWeight] = React.useState(profile?.currentWeight?.toString() || "75");
  const [durationH, setDurationH] = React.useState("1");
  const [durationM, setDurationM] = React.useState("0");
  const [climate, setClimate] = React.useState("moderado");
  const [effort, setEffort] = React.useState("moderado");
  const [hydraRes, setHydraRes] = React.useState<{ total: number; per15: number } | null>(null);

  // --- Estados FC ---
  const [hrMax, setHrMax] = React.useState("185");
  const [hrRest, setHrRest] = React.useState(profile?.restingHr?.toString() || "55");
  const [hrL2, setHrL2] = React.useState(profile?.thresholdHr?.toString() || "165");
  const [fcZones, setFcZones] = React.useState<any[] | null>(null);

  // --- Lógica Hidratação ---
  const calcHydration = () => {
    const w = parseFloat(weight);
    const h = parseFloat(durationH) || 0;
    const m = parseFloat(durationM) || 0;
    const totalHours = h + (m / 60);
    
    // Fatores base: ml por kg por hora
    let factor = 8; // base moderada
    if (climate === "quente") factor += 2;
    if (climate === "muito_quente") factor += 5;
    if (effort === "intenso") factor += 3;
    
    const totalMl = w * factor * totalHours;
    setHydraRes({
      total: Math.round(totalMl),
      per15: Math.round(totalMl / (totalHours * 4))
    });
  };

  // --- Lógica FC (6 Zonas baseadas em L2) ---
  const calcZones = () => {
    const l2 = parseInt(hrL2);
    if (!l2) return;

    const zones = [
      { id: "Z1", label: "RECUPERAÇÃO", color: "bg-blue-500", range: `< ${Math.round(l2 * 0.80)} bpm` },
      { id: "Z2", label: "RESISTÊNCIA AERÓBICA", color: "bg-green-500", range: `${Math.round(l2 * 0.80)}-${Math.round(l2 * 0.90)} bpm` },
      { id: "Z3", label: "POTÊNCIA AERÓBICA", color: "bg-yellow-500", range: `${Math.round(l2 * 0.90)}-${Math.round(l2 * 0.95)} bpm` },
      { id: "Z4", label: "LIMIAR", color: "bg-orange-500", range: `${Math.round(l2 * 0.95)}-${Math.round(l2 * 1.02)} bpm` },
      { id: "Z5", label: "RESISTÊNCIA ANAERÓBICA", color: "bg-red-500", range: `${Math.round(l2 * 1.02)}-${Math.round(l2 * 1.06)} bpm` },
      { id: "Z6", label: "POTÊNCIA ANAERÓBICA", color: "bg-purple-500", range: `> ${Math.round(l2 * 1.06)} bpm` },
    ];
    setFcZones(zones);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <h1 className="text-3xl md:text-4xl font-headline font-black uppercase italic tracking-tighter">
            CALCULADORAS
          </h1>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-[10px] font-black text-primary uppercase italic">
                <Clock className="size-3" /> 90 Dias de Trial
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black">A</div>
                <span className="text-[10px] font-bold uppercase tracking-tight">Atleta <span className="text-muted-foreground font-normal">Perfil Ativo</span></span>
             </div>
          </div>
        </header>

        <div className="px-2">
          <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-lg italic shadow-[0_0_20px_rgba(20,184,166,0.2)]">
            GERAR ESTRATÉGIA
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
          {/* --- CALCULADORA HIDRATAÇÃO --- */}
          <Card className="bg-card/50 border-border/50 shadow-2xl">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2 text-primary">
                <Droplets className="size-4" /> Plano de Hidratação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Peso (kg)</Label>
                  <Input 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-secondary/30 h-12 text-lg font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Duração</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={durationH} 
                      onChange={(e) => setDurationH(e.target.value)}
                      className="bg-secondary/30 h-12 text-lg font-bold" 
                    />
                    <div className="bg-secondary/50 border border-border rounded-md px-3 flex items-center font-bold">H</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Clima</Label>
                  <Select value={climate} onValueChange={setClimate}>
                    <SelectTrigger className="bg-secondary/30 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="quente">Quente</SelectItem>
                      <SelectItem value="muito_quente">Muito Quente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Esforço</Label>
                  <Select value={effort} onValueChange={setEffort}>
                    <SelectTrigger className="bg-secondary/30 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leve">Leve</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="intenso">Intenso / Prova</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={calcHydration}
                className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs"
              >
                CALCULAR PLANO
              </Button>

              {hydraRes && (
                <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border text-center">
                    <div className="text-[9px] font-black uppercase text-muted-foreground mb-1">Total</div>
                    <div className="text-3xl font-black text-primary italic">{hydraRes.total}<small className="text-xs ml-1 font-normal">ml</small></div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border text-center relative group">
                    <div className="text-[9px] font-black uppercase text-muted-foreground mb-1">Cada 15 min</div>
                    <div className="text-3xl font-black text-primary italic">{hydraRes.per15}<small className="text-xs ml-1 font-normal">ml</small></div>
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-5 rounded-xl bg-secondary/10 border border-border/50 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-white">
                   <Lightbulb className="size-4 text-yellow-500" /> Orientações do Coach
                </div>
                <ul className="space-y-2">
                   <li className="text-[10px] text-muted-foreground flex items-start gap-2">
                     <div className="size-1 rounded-full bg-primary mt-1.5" />
                     Ingerir <span className="text-white font-bold">1 cápsula(s) de sais</span> a cada 1h de esforço.
                   </li>
                   <li className="text-[10px] text-muted-foreground flex items-start gap-2">
                     <div className="size-1 rounded-full bg-primary mt-1.5" />
                     Consumir aprox. <span className="text-white font-bold">30g de carbo (2 géis)</span> por hora.
                   </li>
                   <li className="text-[10px] text-muted-foreground flex items-start gap-2">
                     <div className="size-1 rounded-full bg-primary mt-1.5" />
                     Inicie a hidratação 2h antes do treino com 500ml de água.
                   </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* --- CALCULADORA FC --- */}
          <Card className="bg-card/50 border-border/50 shadow-2xl">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2 text-primary">
                <Heart className="size-4" /> Zonas de Esforço (FC)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">FC Máxima (bpm)</Label>
                <Input 
                  type="number" 
                  value={hrMax} 
                  onChange={(e) => setHrMax(e.target.value)}
                  className="bg-secondary/30 h-12 text-lg font-bold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">FC Repouso</Label>
                  <Input 
                    type="number" 
                    value={hrRest} 
                    onChange={(e) => setHrRest(e.target.value)}
                    className="bg-secondary/30 h-12 text-lg font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">FC Limiar (L2)</Label>
                  <Input 
                    type="number" 
                    value={hrL2} 
                    onChange={(e) => setHrL2(e.target.value)}
                    className="bg-secondary/30 h-12 text-lg font-bold border-primary/30" 
                  />
                </div>
              </div>

              <Button 
                onClick={calcZones}
                variant="outline"
                className="w-full h-14 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase tracking-widest text-xs"
              >
                CALCULAR ZONAS
              </Button>

              <div className="space-y-2 mt-4">
                {(fcZones || [
                  { id: "Z1", label: "RECUPERAÇÃO", color: "bg-blue-500", range: "< 132 bpm" },
                  { id: "Z2", label: "RESISTÊNCIA AERÓBICA", color: "bg-green-500", range: "132-149 bpm" },
                  { id: "Z3", label: "POTÊNCIA AERÓBICA", color: "bg-yellow-500", range: "150-157 bpm" },
                  { id: "Z4", label: "LIMIAR", color: "bg-orange-500", range: "158-168 bpm" },
                  { id: "Z5", label: "RESISTÊNCIA ANAERÓBICA", color: "bg-red-500", range: "169-175 bpm" },
                  { id: "Z6", label: "POTÊNCIA ANAERÓBICA", color: "bg-purple-500", range: "> 175 bpm" },
                ]).map((z) => (
                  <div key={z.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/30 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-1 h-6 rounded-full", z.color)} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white italic">{z.id} - {z.label}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-headline font-black text-primary italic">{z.range}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
                <Info className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                  Dica: Use a <span className="text-white font-bold">FC de Limiar (L2)</span> para que as zonas reflitam seu nível real de condicionamento, superando a fórmula da idade.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
