
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Activity, 
  MessageSquare, 
  Trophy, 
  Calculator,
  ChevronRight,
  BookOpen,
  Target,
  Key,
  Download,
  Link2,
  Info,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { AppContext } from "@/contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const items = [
  { title: "DASHBOARD", url: "/", icon: LayoutDashboard },
  { title: "MEU PLANO", url: "/training", icon: Target },
  { title: "EVOLUÇÃO", url: "/analysis", icon: Activity },
  { title: "CONQUISTAS", url: "/vault", icon: Trophy },
  { title: "COACH IA", url: "/coach", icon: MessageSquare },
  { title: "CALCULADORAS", url: "/calculators", icon: Calculator },
  { title: "DICIONÁRIO", url: "/dictionary", icon: BookOpen },
  { title: "INTEGRAÇÕES", url: "/profile", icon: Link2 },
  { title: "MEU PERFIL", url: "/profile", icon: User },
  { title: "SOBRE", url: "/about", icon: Info },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const context = React.useContext(AppContext);
  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const [tempKey, setTempKey] = React.useState("");

  React.useEffect(() => {
    if (context?.isHydrated && !context.apiKey) {
      setShowKeyModal(true);
    }
  }, [context?.isHydrated, context?.apiKey]);

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      context?.setApiKey(tempKey.trim());
      setShowKeyModal(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar collapsible="icon" className="border-r border-border/50">
          <SidebarHeader className="py-8 px-6">
            <div className="flex items-center gap-2">
              <span className="font-headline font-black text-2xl tracking-tighter group-data-[collapsible=icon]:hidden italic">
                <span className="text-white">CORRE</span>
                <span className="text-primary">JUNTO</span>
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200 h-10 px-6",
                          pathname === item.url ? "bg-secondary/50 text-white" : "text-muted-foreground hover:text-white"
                        )}
                      >
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span className="font-headline font-bold text-[11px] tracking-wider">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/20">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full text-muted-foreground hover:text-white" onClick={() => setShowKeyModal(true)}>
                  <Key className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden font-headline font-bold text-[11px] tracking-wider uppercase">Configurar IA</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-white" />
              <div className="font-headline font-black text-lg uppercase italic tracking-tighter hidden md:flex items-center gap-3">
                <span className="text-white">
                   {items.find(i => i.url === pathname)?.title || "PORTAL"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary">
                <Clock className="size-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">90 dias de trial</span>
              </div>
              
              <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                <div className="text-right hidden md:block leading-none">
                  <p className="text-[10px] font-black text-white tracking-widest uppercase italic">Atleta</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-tighter">Perfil Ativo</p>
                </div>
                <div className="size-9 rounded-full bg-primary flex items-center justify-center font-headline font-black text-black shadow-lg shadow-primary/20">
                  {context?.activeProfile?.name?.[0] || 'A'}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16">
            {children}
          </main>
        </SidebarInset>
      </div>

      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline italic font-black uppercase">Configuração de IA</DialogTitle>
            <DialogDescription>
              Insira sua Gemini API Key para ativar o motor de periodização e o Coach.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                1. Gere sua chave gratuita no <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-accent underline font-bold">Google AI Studio</a>.
                <br/>2. Cole abaixo. Seus dados são salvos apenas localmente.
              </p>
              <Input
                placeholder="Cole sua API Key aqui..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="bg-secondary/50 border-border h-12 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveKey} className="w-full font-black uppercase tracking-widest bg-primary text-black">Ativar Inteligência</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
