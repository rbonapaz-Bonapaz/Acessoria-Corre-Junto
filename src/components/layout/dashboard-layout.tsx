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
  Download
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

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Meu Plano", url: "/training", icon: Target },
  { title: "Evolução", url: "/analysis", icon: Activity },
  { title: "Conquistas", url: "/vault", icon: Trophy },
  { title: "Coach IA", url: "/coach", icon: MessageSquare },
  { title: "Calculadoras", url: "/calculators", icon: Calculator },
  { title: "Dicionário", url: "/dictionary", icon: BookOpen },
  { title: "Meus Dados", url: "/profile", icon: User },
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
        <Sidebar collapsible="icon">
          <SidebarHeader className="py-6 px-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center font-headline font-bold text-lg text-black">C</div>
              <span className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">
                <span className="text-white italic">Corre</span>
                <span className="text-primary italic">Junto</span>
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu de Elite</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url}
                        tooltip={item.title}
                        className="transition-all duration-200"
                      >
                        <Link href={item.url}>
                          <item.icon className={cn("size-4", pathname === item.url ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-bold uppercase text-[10px] tracking-widest">{item.title}</span>
                          {pathname === item.url && <ChevronRight className="ml-auto size-4 text-primary" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full" onClick={() => setShowKeyModal(true)}>
                  <Key className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden font-bold uppercase text-[10px]">Configurar IA</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-30">
            <SidebarTrigger />
            <div className="flex-1 flex justify-between items-center px-2 md:px-4">
              <div className="font-headline font-black text-lg flex items-center gap-1 uppercase italic tracking-tighter">
                <span className="text-white">Corre</span>
                <span className="text-primary">Junto</span>
                <span className="hidden sm:inline mx-2 text-muted-foreground/30 font-normal">|</span>
                <span className="hidden sm:inline text-[10px] font-black text-muted-foreground tracking-widest">
                   {items.find(i => i.url === pathname)?.title || "Portal"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => context?.exportData()} className="md:size-9">
                   <Download className="size-4 md:size-5"/>
                </Button>
                <div className="size-8 md:size-9 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                  {context?.activeProfile?.avatarUrl ? (
                    <img src={context.activeProfile.avatarUrl} alt="User" className="size-full object-cover" />
                  ) : (
                    <User className="size-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
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