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
  Info,
  Clock,
  Target,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function CalculatorsPage() {
  const context = React.useContext(AppContext);
  const { toast } = useToast();
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

  // --- Estados Estratégia ---
  const [targetDist, setTargetDist] = React.useState("5");
  const [targetPace, setTargetPace] = React.useState(profile?.thresholdPace || "05:00");
  const [strategy, setStrategy] = React.useState<any | null>(null);

  // --- Lógica Hidratação ---
  const calcHydration = () => {
    const w = parseFloat(weight);
    const h = parseFloat(durationH) || 0;
    const m = parseFloat(durationM) || 0;
    const totalHours = h + (m / 60);
    
    let factor = 8; 
    if (climate === "quente") factor += 2;
    if (climate === "muito_quente") factor += 5;
    if (effort === "intenso") factor += 3;
    
    const totalMl = w * factor * totalHours;
    setHydraRes({
      total: Math.round(totalMl),
      per15: Math.round(totalMl / (totalHours * 4))
    });
  };

  // --- Lógica FC ---
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

  // --- Lógica Estratégia ---
  const calcStrategy = () => {
    const dist = parseFloat(targetDist);
    const [min, sec] = targetPace.split(":").map(Number);
    const paceInSec = (min * 60) + sec;

    // Simulação de estratégia progressiva (Split Negativo)
    const seg1Dist = dist * 0.5;
    const seg2Dist = dist * 0.4;
    const seg3Dist = dist * 0.1;

    const pace1 = paceInSec + 5; // Início levemente mais lento
    const pace2 = paceInSec - 5; // Manutenção no alvo/acima
    const pace3 = paceInSec - 15; // Sprint final

    const formatPace = (s: number) => {
      const m = Math.floor(s / 60);
      const sc = Math.round(s % 60);
      return `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
    };

    const formatTime = (totalSec: number) => {
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = Math.round(totalSec % 60);
      return h > 0 
        ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const splits = [];
    let cumulativeTime = 0;
    for (let i = 1; i <= Math.ceil(dist); i++) {
      let currentPace = paceInSec;
      if (i <= seg1Dist) currentPace = pace1;
      else if (i <= (seg1Dist + seg2Dist)) currentPace = pace2;
      else currentPace = pace3;

      cumulativeTime += currentPace;
      splits.push({ km: i, time: formatTime(cumulativeTime), pace: formatPace(currentPace) });
    }

    setStrategy({
      targetPace,
      segments: [
        { label: `Início (0 a ${seg1Dist.toFixed(1)}k)`, pace: formatPace(pace1), desc: "Poupe energia, ritmo sob controle." },
        { label: `Manutenção (${seg1Dist.toFixed(1)}k a ${(seg1Dist + seg2Dist).toFixed(1)}k)`, pace: formatPace(pace2), desc: "Hora de acelerar e buscar o tempo alvo." },
        { label: `Sprint (${(seg1Dist + seg2Dist).toFixed(1)}k ao fim)`, pace: formatPace(pace3), desc: "Dê tudo de si, sprint total!" }
      ],
      splits
    });
  };

  const copyToClipboard = () => {
    if (!strategy) return;
    const text = `ESTRATÉGIA DE PROVA - CorreJunto\n\n` +
      `Distância: ${targetDist}k\nPace Alvo: ${targetPace} min/km\n\n` +
      `SEGMENTOS:\n` +
      strategy.segments.map((s: any) => `- ${s.label}: ${s.pace} min/km`).join("\n") +
      `\n\nPARCIAIS:\n` +
      strategy.splits.map((s: any) => `KM ${s.km}: ${s.time} (${s.pace})`).join("\n");
    
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Estratégia enviada para a área de transferência." });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <h1 className="text-3xl md:text-4xl font-headline font-black uppercase italic tracking-tighter">
            CALCULADORAS
          </h1>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black">A</div>
                <span className="text-[10px] font-bold uppercase tracking-tight">Atleta <span className="text-muted-foreground font-normal">Perfil Ativo</span></span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
          {/* --- CALCULADORA ESTRATÉGIA --- */}
          <Card className="bg-card/50 border-border/50 shadow-2xl h-fit">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2 text-primary">
                <Target className="size-4" /> Estratégia de Pacing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Distância (km)</Label>
                  <Select value={targetDist} onValueChange={setTargetDist}>
                    <SelectTrigger className="bg-secondary/30 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="21.1">21.1 km</SelectItem>
                      <SelectItem value="42.2">42.2 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Pace Alvo (min/km)</Label>
                  <Input 
                    placeholder="05:00" 
                    value={targetPace} 
                    onChange={(e) => setTargetPace(e.target.value)}
                    className="bg-secondary/30 h-12 text-lg font-bold" 
                  />
                </div>
              </div>
              <Button 
                onClick={calcStrategy}
                className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs"
              >
                GERAR ESTRATÉGIA
              </Button>

              {strategy && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 rounded-2xl bg-secondary/20 border border-primary/20 relative">
                    <Button 
                      onClick={copyToClipboard}
                      variant="outline" 
                      size="sm" 
                      className="absolute top-4 right-4 bg-black/50 border-white/20 text-white text-[10px] font-bold uppercase"
                    >
                      <Copy className="size-3 mr-2" /> COPIAR
                    </Button>
                    
                    <h2 className="text-center font-black uppercase italic text-lg mb-8 tracking-tighter">
                      PACE MÉDIO ALVO: <span className="text-primary">{strategy.targetPace} MIN/KM</span>
                    </h2>

                    <div className="space-y-6 mb-10">
                      <div className="text-[9px] font-black uppercase text-secondary-foreground/50 flex justify-between px-1">
                        <span>SEGMENTO</span>
                        <span>PACE ALVO</span>
                      </div>
                      {strategy.segments.map((seg: any, i: number) => (
                        <div key={i} className="flex justify-between items-start border-b border-border/30 pb-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-white italic">{seg.label}</h4>
                            <p className="text-[10px] text-muted-foreground italic">{seg.desc}</p>
                          </div>
                          <span className="font-headline font-black text-primary italic text-sm">{seg.pace} min/km</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[11px] font-black uppercase italic text-primary tracking-widest px-1">PARCIAIS DE PROVA</h3>
                      <div className="rounded-xl overflow-hidden border border-border/30 bg-black/20">
                        <div className="grid grid-cols-3 p-3 bg-secondary/40 text-[9px] font-black text-muted-foreground uppercase">
                          <span>KM</span>
                          <span className="text-center text-primary">PASSAGEM</span>
                          <span className="text-right">PACE</span>
                        </div>
                        <div className="divide-y divide-border/20">
                          {strategy.splits.map((split: any) => (
                            <div key={split.km} className="grid grid-cols-3 p-4 hover:bg-white/5 transition-colors">
                              <span className="text-xs font-black text-white italic">KM {split.km}</span>
                              <span className="text-center text-accent font-headline font-bold">{split.time}</span>
                              <span className="text-right text-[10px] text-muted-foreground italic">{split.pace} min/km</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
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
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Duração (h)</Label>
                    <Input 
                      type="number" 
                      value={durationH} 
                      onChange={(e) => setDurationH(e.target.value)}
                      className="bg-secondary/30 h-12 text-lg font-bold" 
                    />
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
                  CALCULAR HIDRATAÇÃO
                </Button>

                {hydraRes && (
                  <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border text-center">
                      <div className="text-[9px] font-black uppercase text-muted-foreground mb-1">Total</div>
                      <div className="text-3xl font-black text-primary italic">{hydraRes.total}<small className="text-xs ml-1 font-normal">ml</small></div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border text-center">
                      <div className="text-[9px] font-black uppercase text-muted-foreground mb-1">Cada 15 min</div>
                      <div className="text-3xl font-black text-primary italic">{hydraRes.per15}<small className="text-xs ml-1 font-normal">ml</small></div>
                    </div>
                  </div>
                )}
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
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">FC Limiar (L2)</Label>
                    <Input 
                      type="number" 
                      value={hrL2} 
                      onChange={(e) => setHrL2(e.target.value)}
                      className="bg-secondary/30 h-12 text-lg font-bold border-primary/30" 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={calcZones}
                      variant="outline"
                      className="w-full h-12 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase tracking-widest text-xs"
                    >
                      GERAR ZONAS
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(fcZones || [
                    { id: "Z1", label: "RECUPERAÇÃO", color: "bg-blue-500", range: "< 132 bpm" },
                    { id: "Z2", label: "RESISTÊNCIA AERÓBICA", color: "bg-green-500", range: "132-149 bpm" },
                    { id: "Z3", label: "POTÊNCIA AERÓBICA", color: "bg-yellow-500", range: "150-157 bpm" },
                    { id: "Z4", label: "LIMIAR", color: "bg-orange-500", range: "158-168 bpm" },
                    { id: "Z5", label: "RESISTÊNCIA ANAERÓBICA", color: "bg-red-500", range: "169-175 bpm" },
                    { id: "Z6", label: "POTÊNCIA ANAERÓBICA", color: "bg-purple-500", range: "> 175 bpm" },
                  ]).map((z) => (
                    <div key={z.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-1 h-6 rounded-full", z.color)} />
                        <span className="text-[10px] font-black text-white italic">{z.id} - {z.label}</span>
                      </div>
                      <span className="text-[11px] font-headline font-black text-primary italic">{z.range}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
