
"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Copy,
  Clock,
  Target,
  Activity,
  Milestone,
  TrendingUp,
  MoveRight,
  IterationCcw,
  Info,
  Lightbulb
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function CalculatorsPage() {
  const { toast } = useToast();

  // --- Funções Auxiliares de Formatação ---
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
  
  const formatPace = (minPerKm: number) => {
    if (!minPerKm || minPerKm === Infinity) return "00:00";
    const totalSec = Math.round(minPerKm * 60);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${pad(m)}:${pad(s)}`;
  };

  const formatTime = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes === Infinity) return "00:00:00";
    const totalSec = Math.round(totalMinutes * 60);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: `${title} salvo na área de transferência.` });
  };

  // --- REGRAS DE CÓPIA DE ELITE ---
  const copyStrategyElite = () => {
    if (!sResult) return;
    const typeLabel = sType === 'negative' ? 'Negativo (Início conservador, fim forte)' : sType === 'even' ? 'Constante (Ritmo mantido)' : 'Positivo (Saída rápida)';
    
    let text = `🏃 ESTRATÉGIA DE PROVA CORRE JUNTO 🏃\n`;
    text += `Distância: ${sDist} km | Tempo Alvo: ${pad(Number(sTimeH))}:${pad(Number(sTimeM))}:${pad(Number(sTimeS))}\n`;
    text += `Pace Médio Alvo: ${sResult.avgPace} min/km\n`;
    text += `Perfil: ${typeLabel}\n\n`;
    text += `--- DIVISÃO TÉCNICA ---\n`;
    sResult.segments.forEach((seg: any) => {
      text += `📍 ${seg.label}: ${seg.pace} min/km\n`;
    });
    text += `\n--- PARCIAIS KM A KM ---\n`;
    sResult.splits.forEach((split: any) => {
      text += `KM ${split.km}: ${split.time} (${split.pace})\n`;
    });
    
    copyToClipboard(text, "Estratégia Completa");
  };

  const copyZonesElite = () => {
    if (!fcZones) return;
    let text = `❤️ ZONAS DE ESFORÇO (FC) CORRE JUNTO ❤️\n`;
    text += `FC Máxima: ${fcMax} bpm ${fcLthr ? `| Limiar L2: ${fcLthr} bpm` : ''}\n\n`;
    
    const icons = ["🔵", "🟢", "🟡", "🟠", "🔴", "🟣"];
    fcZones.forEach((z, i) => {
      text += `${icons[i] || "⚪"} ${z.label}: ${z.range} bpm\n`;
    });
    
    text += `\n💡 Dica Técnica: ${fcLthr ? 'Cálculo baseado no seu Limiar de Lactato para precisão de elite.' : 'Cálculo baseado em percentual da FC Máxima. Para maior precisão, use a FC de Limiar (L2).'}`;
    
    copyToClipboard(text, "Zonas de FC");
  };

  const copyHydrationElite = () => {
    if (!hRes) return;
    let text = `💧 PLANO DE NUTRIÇÃO & HIDRATAÇÃO 💧\n`;
    text += `Peso: ${hWeight} kg | Duração: ${pad(Number(hDurH))}h ${pad(Number(hDurM))}min\n\n`;
    text += `--- HIDRATAÇÃO ---\n`;
    text += `💦 Volume Total: ${hRes.vol} ml\n`;
    text += `🕒 Dose Sugerida: ${hRes.per15} ml a cada 15 min\n`;
    text += `🧂 Eletrólitos: ${hRes.caps} cápsula(s) de 250mg de sódio\n\n`;
    text += `--- ENERGIA ---\n`;
    text += `🍬 Carboidratos: ~${hRes.carb}g (aprox. ${Math.max(1, Math.ceil(hRes.carb / 25))} géis)\n\n`;
    text += `⚠️ Dica do Coach: Hidrate-se bem antes da largada! Beba 500ml de água 2h antes da prova.`;
    
    copyToClipboard(text, "Plano de Hidratação");
  };

  // --- 1. CALCULADORA DE PACE ---
  const [pDist, setPDist] = React.useState("10");
  const [pTimeH, setPTimeH] = React.useState("");
  const [pTimeM, setPTimeM] = React.useState("50");
  const [pTimeS, setPTimeS] = React.useState("00");
  const [pResult, setPResult] = React.useState<string | null>(null);

  const calcPaceAction = () => {
    const d = parseFloat(pDist);
    const t = (parseInt(pTimeH) || 0) * 60 + (parseInt(pTimeM) || 0) + (parseInt(pTimeS) || 0) / 60;
    if (d > 0 && t > 0) setPResult(formatPace(t / d));
  };

  // --- 2. CALCULADORA DE TEMPO ---
  const [tDist, setTDist] = React.useState("10");
  const [tPaceM, setTPaceM] = React.useState("5");
  const [tPaceS, setTPaceS] = React.useState("00");
  const [tResult, setTResult] = React.useState<string | null>(null);

  const calcTimeAction = () => {
    const d = parseFloat(tDist);
    const p = (parseInt(tPaceM) || 0) + (parseInt(tPaceS) || 0) / 60;
    if (d > 0 && p > 0) setTResult(formatTime(d * p));
  };

  // --- 3. CALCULADORA DE DISTÂNCIA ---
  const [dTimeH, setDTimeH] = React.useState("1");
  const [dTimeM, setDTimeM] = React.useState("0");
  const [dTimeS, setDTimeS] = React.useState("0");
  const [dPaceM, setDPaceM] = React.useState("5");
  const [dPaceS, setDPaceS] = React.useState("00");
  const [dResult, setDResult] = React.useState<string | null>(null);

  const calcDistAction = () => {
    const t = (parseInt(dTimeH) || 0) * 60 + (parseInt(dTimeM) || 0) + (parseInt(dTimeS) || 0) / 60;
    const p = (parseInt(dPaceM) || 0) + (parseInt(dPaceS) || 0) / 60;
    if (t > 0 && p > 0) setDResult((t / p).toFixed(2) + " km");
  };

  // --- 4. CONVERSOR ESTEIRA ---
  const [ePaceM, setEPaceM] = React.useState("5");
  const [ePaceS, setEPaceS] = React.useState("00");
  const [eVel, setEVel] = React.useState("12.0");
  const [eResPace, setEResPace] = React.useState<string | null>(null);
  const [eResVel, setEResVel] = React.useState<string | null>(null);

  const calcVelFromPace = () => {
    const p = (parseInt(ePaceM) || 0) + (parseInt(ePaceS) || 0) / 60;
    if (p > 0) setEResVel((60 / p).toFixed(1) + " km/h");
  };
  const calcPaceFromVel = () => {
    const v = parseFloat(eVel);
    if (v > 0) setEResPace(formatPace(60 / v));
  };

  // --- 5. ESTRATÉGIA DE PROVA ---
  const [sDist, setSDist] = React.useState("21.1");
  const [sTimeH, setSTimeH] = React.useState("1");
  const [sTimeM, setSTimeM] = React.useState("45");
  const [sTimeS, setSTimeS] = React.useState("00");
  const [sType, setSType] = React.useState<"negative" | "even" | "positive">("negative");
  const [sResult, setSResult] = React.useState<any | null>(null);

  const calcStrategyAction = () => {
    const d = parseFloat(sDist);
    const t = (parseInt(sTimeH) || 0) * 60 + (parseInt(sTimeM) || 0) + (parseInt(sTimeS) || 0) / 60;
    if (!d || t <= 0) {
      toast({ variant: "destructive", title: "Dados incompletos", description: "Informe a distância e o tempo alvo." });
      return;
    }
    const ap = t / d;
    
    let skm = d <= 5.5 ? 0.3 : (d <= 10.5 ? 0.5 : 1);
    const firstEnd = d / 2;
    const sprintStart = d - skm;
    
    let p1, p2, p3;
    if (sType === 'negative') {
      p1 = ap + 8/60; p2 = ap - 8/60; p3 = p2 - 5/60;
    } else if (sType === 'even') {
      p1 = ap; p2 = ap; p3 = ap - 5/60;
    } else {
      p1 = ap - 8/60; p2 = ap + 8/60; p3 = p2;
    }

    const segments = [
      { label: `Início (0 a ${firstEnd.toFixed(1)}k)`, pace: formatPace(p1), desc: "Poupe energia, ritmo sob controle." },
      { label: `Manutenção (${firstEnd.toFixed(1)}k a ${sprintStart.toFixed(1)}k)`, pace: formatPace(p2), desc: "Aceleração gradual." },
      { label: `Sprint Final (${sprintStart.toFixed(1)}k ao fim)`, pace: formatPace(p3), desc: "Esforço máximo!" }
    ];

    const splits = [];
    let cumulative = 0;
    for (let i = 1; i <= Math.ceil(d); i++) {
      const mark = i > d ? d : i;
      const prevMark = i - 1;
      const distInSplit = mark - prevMark;
      let splitPace = ap;
      if (mark <= firstEnd) splitPace = p1;
      else if (mark <= sprintStart) splitPace = p2;
      else splitPace = p3;
      cumulative += distInSplit * splitPace;
      splits.push({ km: mark === d ? d.toFixed(2) : mark, time: formatTime(cumulative), pace: formatPace(splitPace) });
      if (mark === d) break;
    }
    setSResult({ avgPace: formatPace(ap), segments, splits });
  };

  // --- 6. PREVISÃO DE PROVA (Riegel) ---
  const [prDist, setPRDist] = React.useState("5");
  const [prTimeH, setPRTimeH] = React.useState("0");
  const [prTimeM, setPRTimeM] = React.useState("25");
  const [prTimeS, setPRTimeS] = React.useState("00");
  const [prRes, setPRRes] = React.useState<any[] | null>(null);

  const calcPredictorAction = () => {
    const d1 = parseFloat(prDist);
    const t1 = (parseInt(prTimeH) || 0) * 60 + (parseInt(prTimeM) || 0) + (parseInt(prTimeS) || 0) / 60;
    if (d1 <= 0 || t1 <= 0) return;
    const targets = [5, 10, 21.097, 42.195];
    const results = targets.map(d2 => {
      const t2 = t1 * Math.pow(d2 / d1, 1.06);
      return { dist: d2 === 21.097 ? "Meia" : d2 === 42.195 ? "Maratona" : d2 + "k", time: formatTime(t2), pace: formatPace(t2 / d2) };
    });
    setPRRes(results);
  };

  // --- 7. ZONAS DE FC ---
  const [fcMax, setFCMax] = React.useState("185");
  const [fcRest, setFCRest] = React.useState("");
  const [fcLthr, setFCLthr] = React.useState("");
  const [fcZones, setFCZones] = React.useState<any[] | null>(null);

  const calcZonesAction = () => {
    const max = parseInt(fcMax);
    const lthr = parseInt(fcLthr);
    if (lthr > 0) {
      setFCZones([
        { label: "Z1 - Recuperação", range: `< ${Math.round(lthr * 0.80)}`, color: "bg-slate-500" },
        { label: "Z2 - Base Aeróbica", range: `${Math.round(lthr * 0.80)}-${Math.round(lthr * 0.90)}`, color: "bg-emerald-500" },
        { label: "Z3 - Potência Aeróbica", range: `${Math.round(lthr * 0.90)+1}-${Math.round(lthr * 0.95)}`, color: "bg-yellow-500" },
        { label: "Z4 - Limiar", range: `${Math.round(lthr * 0.95)+1}-${Math.round(lthr * 1.02)}`, color: "bg-orange-500" },
        { label: "Z5 - Anaeróbica", range: `${Math.round(lthr * 1.02)+1}-${Math.round(lthr * 1.06)}`, color: "bg-red-500" },
        { label: "Z6 - Potência", range: `> ${Math.round(lthr * 1.06)}`, color: "bg-purple-600" },
      ]);
    } else {
      setFCZones([
        { label: "Z1 - Recuperação", range: `${Math.round(max * 0.5)}-${Math.round(max * 0.6)}`, color: "bg-slate-500" },
        { label: "Z2 - Resistência", range: `${Math.round(max * 0.6)+1}-${Math.round(max * 0.7)}`, color: "bg-emerald-500" },
        { label: "Z3 - Moderado", range: `${Math.round(max * 0.7)+1}-${Math.round(max * 0.8)}`, color: "bg-yellow-500" },
        { label: "Z4 - Limiar", range: `${Math.round(max * 0.8)+1}-${Math.round(max * 0.9)}`, color: "bg-orange-500" },
        { label: "Z5 - Máxima", range: `${Math.round(max * 0.9)+1}-${max}`, color: "bg-red-500" },
      ]);
    }
  };

  // --- 8. HIDRATAÇÃO ---
  const [hWeight, setHWeight] = React.useState("75");
  const [hDurH, setHDurH] = React.useState("1");
  const [hDurM, setHDurM] = React.useState("0");
  const [hClimate, setHClimate] = React.useState("1.0");
  const [hInt, setHInt] = React.useState("1.0");
  const [hRes, setHRes] = React.useState<any | null>(null);

  const calcHidraAction = () => {
    const w = parseFloat(hWeight);
    const tH = (parseInt(hDurH) || 0) + (parseInt(hDurM) || 0) / 60;
    const fc = parseFloat(hClimate);
    const fi = parseFloat(hInt);
    const vol = Math.round(w * 8 * fc * fi * tH);
    const per15 = Math.round(vol / (tH * 4));
    const caps = Math.ceil(tH * (fc * fi > 1.3 ? 2 : 1));
    const carb = Math.round((fi <= 1.0 ? 30 : 50) * tH);
    setHRes({ vol, per15, caps, carb });
  };

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
          <header className="px-4">
            <h1 className="text-3xl md:text-5xl font-headline font-black uppercase italic tracking-tighter leading-none">
              <span className="text-white">CENTRAL DE</span> <br/>
              <span className="text-primary">CÁLCULOS ELITE</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg font-medium max-w-2xl mt-4">
              Ferramentas técnicas calibradas para precisão de performance. Entenda seus números para dominar seu asfalto.
            </p>
          </header>

          <Tabs defaultValue="essenciais" className="w-full">
            <div className="px-4 sticky top-16 z-20 bg-background/95 backdrop-blur-md py-4 border-b border-border/10">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1.5 rounded-2xl h-auto gap-2 shadow-inner">
                <TabsTrigger value="essenciais" className="py-4 font-black text-xs md:text-sm uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl">
                  <Zap className="size-4" /> Básicos
                </TabsTrigger>
                <TabsTrigger value="planejamento" className="py-4 font-black text-xs md:text-sm uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl">
                  <Target className="size-4" /> Planejamento
                </TabsTrigger>
              </TabsList>
            </div>

            {/* --- ABA ESSENCIAIS --- */}
            <TabsContent value="essenciais" className="mt-8 space-y-8 px-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* PACE */}
                <Card className="bg-card/40 border-border/50 flex flex-col hover:border-primary/40 transition-colors rounded-2xl shadow-xl overflow-hidden">
                  <CardHeader className="pb-4 bg-secondary/10 border-b border-border/10">
                    <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <Activity className="size-3" /> Calcular Pace
                    </CardTitle>
                    <p className="text-[9px] text-muted-foreground italic leading-tight mt-1">Descubra o ritmo médio necessário para o tempo alvo.</p>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Distância (km)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                          <TooltipContent><p className="max-w-xs text-[10px]">A distância total que você pretende percorrer.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <Input type="number" value={pDist} onChange={e => setPDist(e.target.value)} className="bg-black/30 h-14 text-2xl font-black border-border/40 focus:border-primary text-center rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest text-center block">Tempo Final</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" placeholder="H" value={pTimeH} onChange={e => setPTimeH(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <Input type="number" placeholder="M" value={pTimeM} onChange={e => setPTimeM(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <Input type="number" placeholder="S" value={pTimeS} onChange={e => setPTimeS(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                      </div>
                    </div>
                    <Button className="w-full h-14 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-primary/10" onClick={calcPaceAction}>Calcular</Button>
                  </CardContent>
                </Card>

                {/* TEMPO */}
                <Card className="bg-card/40 border-border/50 flex flex-col hover:border-primary/40 transition-colors rounded-2xl shadow-xl overflow-hidden">
                  <CardHeader className="pb-4 bg-secondary/10 border-b border-border/10">
                    <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <Clock className="size-3" /> Calcular Tempo
                    </CardTitle>
                    <p className="text-[9px] text-muted-foreground italic leading-tight mt-1">Estime seu tempo de chegada baseando-se no ritmo.</p>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Distância (km)</Label>
                      <Input type="number" value={tDist} onChange={e => setTDist(e.target.value)} className="bg-black/30 h-14 text-2xl font-black text-center rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Pace Alvo (min/km)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="Min" value={tPaceM} onChange={e => setTPaceM(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <Input type="number" placeholder="Seg" value={tPaceS} onChange={e => setTPaceS(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                      </div>
                    </div>
                    <Button className="w-full h-14 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl" onClick={calcTimeAction}>Calcular</Button>
                  </CardContent>
                </Card>

                {/* DISTÂNCIA */}
                <Card className="bg-card/40 border-border/50 flex flex-col hover:border-primary/40 transition-colors rounded-2xl shadow-xl overflow-hidden">
                  <CardHeader className="pb-4 bg-secondary/10 border-b border-border/10">
                    <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <Milestone className="size-3" /> Calcular Distância
                    </CardTitle>
                    <p className="text-[9px] text-muted-foreground italic leading-tight mt-1">Quanto você percorrerá no tempo que tem disponível?</p>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Tempo Total</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" placeholder="H" value={dTimeH} onChange={e => setDTimeH(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <Input type="number" placeholder="M" value={dTimeM} onChange={e => setDTimeM(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <Input type="number" placeholder="S" value={dTimeS} onChange={e => setDTimeS(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Pace Médio</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="Min" value={dPaceM} onChange={e => setDPaceM(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <Input type="number" placeholder="Seg" value={dPaceS} onChange={e => setDPaceS(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                      </div>
                    </div>
                    <Button className="w-full h-14 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl" onClick={calcDistAction}>Calcular</Button>
                  </CardContent>
                </Card>

                {/* ESTEIRA */}
                <Card className="bg-card/40 border-border/50 flex flex-col hover:border-primary/40 transition-colors rounded-2xl shadow-xl overflow-hidden">
                  <CardHeader className="pb-4 bg-secondary/10 border-b border-border/10">
                    <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <MoveRight className="size-3" /> Conversor Esteira
                    </CardTitle>
                    <p className="text-[9px] text-muted-foreground italic leading-tight mt-1">Alinhe seu pace (min/km) com a velocidade (km/h).</p>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Ritmo ➔ Velocidade</Label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="Min" value={ePaceM} onChange={e => setEPaceM(e.target.value)} className="bg-black/30 h-14 text-center text-lg font-black rounded-xl flex-1" />
                        <Input type="number" placeholder="Seg" value={ePaceS} onChange={e => setEPaceS(e.target.value)} className="bg-black/30 h-14 text-center text-lg font-black rounded-xl flex-1" />
                        <Button variant="outline" className="shrink-0 h-14 w-14 border-primary/30 text-primary hover:bg-primary/20 rounded-xl" onClick={calcVelFromPace}><MoveRight size={20} /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* --- ABA PLANEJAMENTO --- */}
            <TabsContent value="planejamento" className="mt-8 space-y-8 px-4 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ESTRATÉGIA DE PACE */}
                <Card className="lg:col-span-2 bg-card/40 border-border/50 overflow-hidden shadow-2xl rounded-3xl">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-8 px-8">
                    <CardTitle className="text-lg font-black uppercase italic text-primary flex items-center gap-3 tracking-tighter">
                      <TrendingUp size={24} /> Pacing de Prova Estratégico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-10 px-8 pb-12 space-y-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-black uppercase italic tracking-widest text-muted-foreground">Perfil da Estratégia</Label>
                        <Tooltip>
                          <TooltipTrigger asChild><Info className="size-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                          <TooltipContent><p className="max-w-xs text-sm">Define como você distribuirá seu esforço ao longo da prova.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {["negative", "even", "positive"].map(type => (
                          <Button 
                            key={type} 
                            variant={sType === type ? "default" : "secondary"} 
                            className={cn("h-14 font-black uppercase italic rounded-2xl", sType === type ? "bg-primary text-black" : "bg-secondary/40")}
                            onClick={() => setSType(type as any)}
                          >
                            {type === 'negative' ? 'Negativo' : type === 'even' ? 'Constante' : 'Positivo'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full h-16 bg-primary text-black font-black uppercase italic tracking-widest text-xl rounded-2xl" onClick={calcStrategyAction}>Gerar Estratégia</Button>
                  </CardContent>
                </Card>

                {/* HIDRATAÇÃO */}
                <Card className="bg-card/40 border-border/50 rounded-2xl shadow-xl">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-[11px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <Droplets className="size-4" /> Nutrição & Hidratação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 px-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest opacity-70">Peso (kg)</Label>
                          <Tooltip>
                            <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                            <TooltipContent><p className="max-w-xs text-[10px]">Utilizado para calcular a taxa de suor e perda de eletrólitos.</p></TooltipContent>
                          </Tooltip>
                        </div>
                        <Input type="number" value={hWeight} onChange={e => setHWeight(e.target.value)} className="bg-black/20 h-12 font-black text-lg rounded-xl text-center" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full h-12 text-[11px] border-primary/30 text-primary font-black uppercase italic tracking-widest rounded-xl hover:bg-primary hover:text-black" onClick={calcHidraAction}>Calcular Planejamento</Button>
                  </CardContent>
                </Card>

                {/* ZONAS FC */}
                <Card className="bg-card/40 border-border/50 rounded-2xl shadow-xl">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-[11px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <Heart className="size-4" /> Zonas de Esforço (FC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 px-6 space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-[9px] font-black uppercase tracking-tighter opacity-60">Limiar L2</Label>
                          <Tooltip>
                            <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                            <TooltipContent><p className="max-w-xs text-[10px]">Sua frequência cardíaca no ponto de transição aeróbica-anaeróbica (Padrão Ouro).</p></TooltipContent>
                          </Tooltip>
                        </div>
                        <Input type="number" placeholder="L2" value={fcLthr} onChange={e => setFCLthr(e.target.value)} className="bg-black/20 h-12 px-1 text-center font-black rounded-xl" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full h-12 text-[11px] border-primary/30 text-primary font-black uppercase italic tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all" onClick={calcZonesAction}>Gerar Zonas</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
