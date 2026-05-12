"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, History, Calendar, Clock, MapPin, Milestone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const records = [
  { distance: "5K", time: "18:42", date: "Aug 15, 2024", event: "Summer Series", pace: "6:01/mi" },
  { distance: "10K", time: "39:15", date: "Sep 22, 2024", event: "City Run", pace: "6:19/mi" },
  { distance: "Half Marathon", time: "1:26:40", date: "Oct 05, 2024", event: "Grand Canal Half", pace: "6:37/mi" },
  { distance: "Marathon", time: "3:12:05", date: "Nov 20, 2023", event: "Berlin Marathon", pace: "7:19/mi" },
];

export default function VaultPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold">Records Vault</h1>
            <p className="text-muted-foreground">Your athletic legacy and verified personal milestones.</p>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl border">
            <Trophy className="size-5 text-accent" />
            <span className="font-bold font-headline">Level 14 Athlete</span>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {records.map((record) => (
            <Card key={record.distance} className="bg-card border-border hover:border-accent transition-all group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent/20 group-hover:bg-accent transition-colors" />
              <CardHeader className="pb-2">
                <CardDescription className="text-accent font-bold tracking-widest uppercase text-[10px]">{record.distance}</CardDescription>
                <CardTitle className="font-headline text-3xl font-bold">{record.time}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>{record.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-3 text-muted-foreground" />
                    <span className="truncate">{record.event}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground font-mono">
                  {record.pace}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <History className="size-5 text-accent" /> Milestone History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { title: "Broke 1:30 Half Marathon", date: "Oct 2024", desc: "Improved by 4 minutes at Grand Canal Half" },
                  { title: "100 Day Run Streak", date: "Sep 2024", desc: "Completed 100 consecutive days of training" },
                  { title: "VO2 Max Breakthrough", date: "Aug 2024", desc: "Reached VDOT 54 for the first time" },
                ].map((m, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== 2 && <div className="absolute left-[15px] top-10 bottom-[-10px] w-0.5 bg-border" />}
                    <div className="size-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 z-10">
                      <Star className="size-4 text-accent" />
                    </div>
                    <div className="pb-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-headline">{m.title}</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded">{m.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border h-fit">
            <CardHeader>
              <CardTitle className="font-headline">Lifetime Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <Milestone className="size-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Distance</span>
                </div>
                <span className="font-bold font-headline">4,285 km</span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Training Time</span>
                </div>
                <span className="font-bold font-headline">412 hrs</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <Zap className="size-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Calories Burned</span>
                </div>
                <span className="font-bold font-headline">284k kcal</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { Zap } from "lucide-react";
