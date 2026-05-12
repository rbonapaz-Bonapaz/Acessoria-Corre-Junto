"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { chatWithAICoach, type ChatWithAICoachOutput } from "@/ai/flows/chat-with-ai-coach";
import { AppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  Paperclip, 
  Info, 
  Copy, 
  Check,
  BrainCircuit,
  History,
  Zap,
  Dna
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Message = {
  role: "user" | "model";
  parts: string;
};

export default function CoachPage() {
  const context = React.useContext(AppContext);
  const { toast } = useToast();
  const profile = context?.activeProfile;
  const plan = context?.trainingPlan;

  const [messages, setMessages] = React.useState<Message[]>([
    { role: "model", parts: "Olá! Eu sou o Gemini, seu treinador de corrida IA. Como foi seu treino hoje? Posso analisar seus dados de ritmo, fadiga ou até ajustar sua planilha se você não estiver se sentindo bem." }
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copiado!", description: "Mensagem salva na área de transferência." });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!context?.apiKey) {
      toast({ variant: "destructive", title: "IA Desativada", description: "Configure sua Gemini API Key no menu lateral." });
      return;
    }

    const userMessage: Message = { role: "user", parts: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Contexto rico baseado no estado real do app
      const workoutHistoryContext = `Perfil: ${profile?.name || 'Atleta'}. Peso: ${profile?.currentWeight}kg. Pace T: ${profile?.thresholdPace}. FC Limiar: ${profile?.thresholdHr}bpm.`;
      const planContext = plan ? `Atualmente no bloco ${plan.blockType}. Objetivo: ${profile?.raceDistance} em ${profile?.raceDate}.` : "Sem plano ativo no momento.";

      const response = await chatWithAICoach({
        conversationHistory: [...messages, userMessage],
        workoutHistory: workoutHistoryContext,
        trainingPlan: planContext
      });

      setMessages(prev => [...prev, { role: "model", parts: response.feedback }]);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro na IA", description: "Não foi possível obter resposta do Coach." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-4 animate-in fade-in duration-500">
        <Card className="flex-1 bg-card border-border flex flex-col overflow-hidden shadow-2xl relative rounded-3xl">
          <CardHeader className="border-b py-4 px-6 bg-secondary/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Bot className="size-6 text-black" />
              </div>
              <div>
                <CardTitle className="font-headline text-lg uppercase italic font-black">Coach Gemini</CardTitle>
                <div className="flex items-center gap-2 text-[10px] text-accent font-bold uppercase tracking-widest">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  Consciência Contextual Ativa
                </div>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Info className="size-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-headline font-black uppercase italic text-primary text-xl">Regras de Funcionamento do Coach IA</DialogTitle>
                  <DialogDescription className="text-xs uppercase font-bold tracking-widest">A lógica de elite por trás do seu treinador</DialogDescription>
                </DialogHeader>
                <div className="space-y-8 mt-6">
                  <section className="space-y-3">
                    <h3 className="font-headline font-bold flex items-center gap-2 text-white"><BrainCircuit className="size-4 text-primary"/> 1. Consciência Contextual Total</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">Ao iniciar uma conversa, a IA recebe instantaneamente três pacotes de dados: seu <strong>Perfil Fisiológico</strong> (T-Pace, FC Limiar), seu <strong>Plano de Treino Atual</strong> e o <strong>Contexto do Treino</strong> selecionado.</p>
                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs italic text-primary">
                      <strong>Conexão:</strong> Se você disser "estou cansado", ela verificará se ontem foi seu <strong>Leg Day</strong> ou se você vem de uma sequência de tiros de VO2 e sugerirá um ajuste técnico.
                    </div>
                  </section>

                  <section className="space-y-3 border-t border-border/50 pt-6">
                    <h3 className="font-headline font-bold flex items-center gap-2 text-white"><Zap className="size-4 text-yellow-500"/> 2. Processamento de Históricos Externos</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">Uma regra de ouro do sistema é a capacidade de "ler" conversas coladas de outras plataformas (como o Gemini padrão ou ChatGPT).</p>
                    <div className="p-3 bg-secondary/50 border border-border rounded-xl text-xs italic">
                      <strong>Funcionalidade:</strong> O Coach IA identifica as métricas contidas em textos colados e oferece calibração imediata para sua planilha oficial.
                    </div>
                  </section>

                  <section className="space-y-3 border-t border-border/50 pt-6">
                    <h3 className="font-headline font-bold flex items-center gap-2 text-white"><History className="size-4 text-accent"/> 3. Gestão de Memória e Histórico</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">Toda interação relevante é salva no sistema. O Coach usa esse histórico para notar tendências e padrões de longo prazo.</p>
                    <div className="p-3 bg-accent/5 border border-accent/10 rounded-xl text-xs italic text-accent">
                      <strong>Exemplo:</strong> "Notei que nas últimas 3 semanas você sentiu dores após o longão. Vamos reduzir o volume da próxima fase?"
                    </div>
                  </section>

                  <section className="space-y-3 border-t border-border/50 pt-6">
                    <h3 className="font-headline font-bold flex items-center gap-2 text-white"><Dna className="size-4 text-purple-500"/> 4. Integração com Análise Biomecânica</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">Ao receber dados de arquivos <strong>.FIT</strong> ou <strong>.CSV</strong>, o Coach processa Razão da Passada e Cadência para gerar feedback técnico de elite.</p>
                  </section>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-black/20">
            <ScrollArea className="h-full p-6" ref={scrollRef}>
              <div className="space-y-8">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-4 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`size-9 border-2 ${msg.role === 'model' ? 'border-primary bg-primary shadow-lg shadow-primary/10' : 'border-border bg-secondary'}`}>
                      <AvatarFallback className="font-black">
                        {msg.role === 'model' ? <Bot className="size-5 text-black" /> : <User className="size-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[85%] relative rounded-2xl p-4 text-sm leading-relaxed shadow-xl ${
                      msg.role === 'user' 
                        ? 'bg-accent text-black font-bold' 
                        : 'bg-card border border-border/50 text-white italic'
                    }`}>
                      {msg.parts}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleCopy(msg.parts, i)}
                        className={`absolute -bottom-10 ${msg.role === 'user' ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity size-8 text-muted-foreground hover:text-primary`}
                      >
                        {copiedId === i ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-4 animate-pulse">
                    <Avatar className="size-9 border-2 border-primary bg-primary">
                      <AvatarFallback><Bot className="size-5 text-black" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span className="text-[10px] font-black uppercase italic tracking-tighter text-muted-foreground">Processando Contexto...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t bg-secondary/20">
            <div className="flex w-full gap-3 items-end">
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary h-12 w-12 rounded-xl bg-secondary/50">
                <Paperclip className="size-5" />
              </Button>
              <div className="flex-1 relative">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Relate seu cansaço, cole um treino ou pergunte..."
                  className="bg-card border-border/50 h-12 pr-12 rounded-xl focus-visible:ring-primary font-medium"
                />
                <Button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon" 
                  className="absolute right-1.5 top-1.5 size-9 bg-primary hover:bg-primary/90 rounded-lg text-black"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-wrap gap-2 justify-center pb-4">
          {[
            "Estou muito cansado hoje, o que eu faço?",
            "Analise meu Pace de Limiar",
            "Ajuste meu plano (dor no joelho)",
            "Como foi meu volume esta semana?"
          ].map(suggestion => (
            <Button 
              key={suggestion} 
              variant="outline" 
              size="sm" 
              className="rounded-full bg-secondary/30 text-[10px] font-black uppercase italic border-border/50 hover:bg-primary hover:text-black transition-all"
              onClick={() => setInput(suggestion)}
            >
              <Sparkles className="mr-2 size-3" /> {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
