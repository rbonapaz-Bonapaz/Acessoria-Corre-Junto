
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User as UserIcon, 
  Activity, 
  MessageSquare, 
  Trophy, 
  Calculator,
  BookOpen,
  Target,
  Key,
  Link2,
  Info,
  Loader2,
  LogIn,
  LogOut,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { TrainingContext } from "@/contexts/TrainingContext";
import { useUser } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { title: "DASHBOARD", url: "/", icon: LayoutDashboard },
  { title: "MEU PLANO", url: "/training", icon: Target },
  { title: "EVOLUÇÃO", url: "/analysis", icon: Activity },
  { title: "CONQUISTAS", url: "/vault", icon: Trophy },
  { title: "COACH IA", url: "/coach", icon: MessageSquare },
  { title: "CALCULADORAS", url: "/calculators", icon: Calculator },
  { title: "DICIONÁRIO", url: "/dictionary", icon: BookOpen },
  { title: "INTEGRAÇÕES", url: "/integrations", icon: Link2 },
  { title: "PERFIL ATLETA", url: "/profile", icon: UserIcon },
  { title: "SOBRE", url: "/about", icon: Info },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const context = React.useContext(TrainingContext);
  const { user, loading: authLoading } = useUser();
  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const [tempKey, setTempKey] = React.useState("");

  React.useEffect(() => {
    if (context?.apiKey) setTempKey(context.apiKey);
  }, [context?.apiKey]);

  const handleSaveKey = () => {
    if (tempKey.trim() && context) {
      context.setApiKey(tempKey.trim());
      setShowKeyModal(false);
    }
  };

  if (!context?.isHydrated || authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="size-12 animate-spin text-primary" />
        <p className="font-headline font-black uppercase italic tracking-widest text-primary animate-pulse">Sincronizando Laboratório...</p>
      </div>
    );
  }

  const isIAActive = !!(context?.apiKey && context.apiKey.trim() !== "");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar collapsible="icon" className="border-r border-border/50">
          <SidebarHeader className="py-8 px-4 flex items-center justify-center overflow-hidden">
            <LogoDisplay />
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
                          pathname === item.url ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
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
          <SidebarFooter className="p-4 border-t border-border/20 space-y-2">
            <SidebarMenuItem>
              <SidebarMenuButton 
                className={cn(
                  "w-full h-12 border transition-all rounded-xl",
                  isIAActive ? "text-primary border-primary/20 bg-primary/5" : "text-muted-foreground border-border/20"
                )} 
                onClick={() => setShowKeyModal(true)}
              >
                <Key className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden font-headline font-bold text-[11px] tracking-wider uppercase">
                  {isIAActive ? "IA ATIVA" : "Configurar IA"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {!user && (
               <SidebarMenuItem>
                <SidebarMenuButton 
                  className="w-full h-12 bg-white text-black hover:bg-primary rounded-xl" 
                  onClick={() => context?.login()}
                >
                  <LogIn className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden font-headline font-bold text-[11px] tracking-wider uppercase">Entrar / Salvar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-white" />
              <div className="font-headline font-black text-lg uppercase italic tracking-tighter flex items-center gap-3">
                <span className="text-white">
                   {items.find(i => i.url === pathname)?.title || "PORTAL"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 focus:outline-none group">
                      <div className="text-right hidden md:block leading-none">
                        <p className="text-[10px] font-black text-white tracking-widest uppercase italic group-hover:text-primary transition-colors">
                          {context?.activeProfile?.name || user?.displayName?.split(' ')[0] || 'CONVIDADO'}
                        </p>
                        <p className={cn(
                          "text-[9px] font-bold uppercase tracking-tighter",
                          user ? "text-primary" : "text-muted-foreground"
                        )}>
                          {user ? "Sincronizado" : "Modo Local"}
                        </p>
                      </div>
                      <div className="size-9 rounded-full bg-secondary border-2 border-border flex items-center justify-center font-headline font-black text-white shadow-lg overflow-hidden group-hover:border-primary transition-all">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-secondary">
                            {context?.activeProfile?.name?.[0] || <UserIcon size={16} />}
                          </div>
                        )}
                      </div>
                      <ChevronDown size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-2xl rounded-2xl p-2">
                    <DropdownMenuLabel className="font-headline font-black uppercase italic text-[10px] tracking-widest px-2 py-1.5 text-muted-foreground">Meu Laboratório</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-primary focus:text-black cursor-pointer">
                      <Link href="/profile" className="flex items-center gap-2 font-bold text-xs uppercase italic py-2.5">
                        <UserIcon className="size-4" /> Perfil Atleta
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowKeyModal(true)} className="rounded-xl focus:bg-primary focus:text-black cursor-pointer flex items-center gap-2 font-bold text-xs uppercase italic py-2.5">
                      <Key className="size-4" /> Configurar IA
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    {user ? (
                      <>
                        <DropdownMenuItem onClick={() => context?.login()} className="rounded-xl focus:bg-primary focus:text-black cursor-pointer flex items-center gap-2 font-bold text-xs uppercase italic py-2.5">
                          <LogIn className="size-4" /> Trocar Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => context?.logout()} className="rounded-xl focus:bg-destructive/10 focus:text-destructive cursor-pointer flex items-center gap-2 font-bold text-xs uppercase italic text-destructive py-2.5">
                          <LogOut className="size-4" /> Sair da Conta
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => context?.login()} className="rounded-xl focus:bg-primary focus:text-black cursor-pointer flex items-center gap-2 font-bold text-xs uppercase italic text-primary py-2.5">
                        <LogIn className="size-4" /> Entrar / Sincronizar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16">
            {children}
          </main>
        </SidebarInset>
      </div>

      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline italic font-black uppercase tracking-tighter text-2xl">Inteligência de Elite</DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              Configure sua chave para processamento cloud.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Sua Gemini API Key garante o motor de geração de performance. Salva localmente e sincronizada na nuvem.
              </p>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                <p className="text-[9px] font-black uppercase text-primary italic">Não tem uma chave?</p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-[11px] font-bold text-white hover:text-primary transition-colors group"
                >
                  Obter Chave no Google AI Studio
                  <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
              <Input
                placeholder="Cole sua API Key aqui..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="bg-secondary/50 border-border h-14 font-mono text-xs rounded-xl focus:border-primary text-center"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveKey} className="w-full font-black uppercase tracking-widest bg-primary text-black h-16 rounded-2xl shadow-xl shadow-primary/20 text-lg italic">Ativar Inteligência</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

function LogoDisplay() {
  const { state } = useSidebar();
  
  if (state === "collapsed") {
    return (
      <div className="font-headline font-black text-2xl italic tracking-tighter flex flex-col items-center leading-none">
        <span className="text-white">C</span>
        <span className="text-primary">J</span>
      </div>
    );
  }

  return (
    <div className="font-headline font-black text-3xl italic tracking-tighter flex flex-col items-center leading-none">
      <span className="text-white">CORRE</span>
      <span className="text-primary">JUNTO</span>
    </div>
  );
}
