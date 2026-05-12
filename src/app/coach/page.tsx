"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { chatWithAICoach, type ChatWithAICoachOutput } from "@/ai/flows/chat-with-ai-coach";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, Loader2, Paperclip } from "lucide-react";

type Message = {
  role: "user" | "model";
  parts: string;
};

export default function CoachPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "model", parts: "Olá! Eu sou o Gemini, seu treinador de corrida IA. Como foi seu treino hoje? Cole seus dados aqui para que eu possa analisá-los." }
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", parts: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithAICoach({
        conversationHistory: [...messages, userMessage],
        workoutHistory: "Recente: Longão 16km @ 5:05/km, FC 145 média. Senti-me forte.",
        trainingPlan: "Atualmente na Semana 2 da fase de Construção. Alvo: Sub 3:15 Maratona."
      });

      setMessages(prev => [...prev, { role: "model", parts: response.feedback }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-4 animate-in fade-in duration-500">
        <Card className="flex-1 bg-card border-border flex flex-col overflow-hidden shadow-2xl relative">
          <CardHeader className="border-b py-3 px-6 bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="size-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="font-headline text-lg">Treinador Gemini</CardTitle>
                <div className="flex items-center gap-2 text-xs text-accent">
                  <span className="size-2 rounded-full bg-accent animate-pulse" />
                  Online e Analisando
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`size-8 border ${msg.role === 'model' ? 'bg-primary' : 'bg-secondary'}`}>
                      <AvatarFallback>
                        {msg.role === 'model' ? <Bot className="size-4" /> : <User className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-accent text-accent-foreground font-medium' 
                        : 'bg-secondary/50 border border-border'
                    }`}>
                      {msg.parts}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-4">
                    <Avatar className="size-8 border bg-primary">
                      <AvatarFallback><Bot className="size-4" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                      <Loader2 className="size-4 animate-spin text-accent" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t bg-secondary/10">
            <div className="flex w-full gap-2 items-end">
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                <Paperclip className="size-5" />
              </Button>
              <div className="flex-1 relative">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pergunte sobre seu treino ou cole dados..."
                  className="bg-secondary/50 border-border h-12 pr-12 rounded-xl focus-visible:ring-accent"
                />
                <Button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon" 
                  className="absolute right-1.5 top-1.5 size-9 bg-primary hover:bg-primary/90 rounded-lg"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "Analise minha última maratona",
            "Ajuste plano por dor no joelho",
            "Qual deve ser meu ritmo de tempo?",
            "Planeje estratégia para 5K"
          ].map(suggestion => (
            <Button 
              key={suggestion} 
              variant="outline" 
              size="sm" 
              className="rounded-full bg-secondary/30 text-xs border-border hover:bg-accent hover:text-accent-foreground"
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
