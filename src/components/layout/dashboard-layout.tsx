"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Activity, 
  MessageSquare, 
  FileSearch, 
  Settings, 
  Trophy, 
  Calculator,
  ChevronRight,
  Menu
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

const items = [
  { title: "Painel", url: "/", icon: LayoutDashboard },
  { title: "Perfil do Atleta", url: "/profile", icon: User },
  { title: "Motor de Treino", url: "/training", icon: Activity },
  { title: "Treinador IA", url: "/coach", icon: MessageSquare },
  { title: "Analisador de Arquivos", url: "/analysis", icon: FileSearch },
  { title: "Cofre e Recordes", url: "/vault", icon: Trophy },
  { title: "Suíte de Utilidades", url: "/utilities", icon: Calculator },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="py-6 px-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center font-headline font-bold text-lg">C</div>
              <span className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">
                Corre<span className="text-accent">Junto</span>
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu Principal</SidebarGroupLabel>
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
                          <item.icon className={cn("size-4", pathname === item.url ? "text-accent" : "text-muted-foreground")} />
                          <span className="font-medium">{item.title}</span>
                          {pathname === item.url && <ChevronRight className="ml-auto size-4 text-accent" />}
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
                <SidebarMenuButton className="w-full">
                  <Settings className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-30">
            <SidebarTrigger />
            <div className="flex-1 flex justify-between items-center px-4">
              <h1 className="font-headline font-semibold text-lg">
                {items.find(i => i.url === pathname)?.title || "CorreJunto"}
              </h1>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="hidden md:flex bg-secondary">
                  Conectar Garmin
                </Button>
                <div className="size-8 rounded-full bg-secondary border flex items-center justify-center">
                  <User className="size-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
