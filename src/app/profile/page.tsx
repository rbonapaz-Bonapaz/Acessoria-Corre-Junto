"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Activity, 
  Utensils, 
  Dumbbell, 
  Save,
  ChevronRight,
  Info
} from "lucide-react";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold">Athlete Profile</h1>
            <p className="text-muted-foreground">Manage your physiological data and performance metrics.</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="mr-2 size-4" /> Save All Changes
          </Button>
        </header>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary rounded-xl p-1 h-12">
            <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent">
              <User className="mr-2 size-4 hidden md:block" /> General
            </TabsTrigger>
            <TabsTrigger value="running" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent">
              <Activity className="mr-2 size-4 hidden md:block" /> Running
            </TabsTrigger>
            <TabsTrigger value="diet" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent">
              <Utensils className="mr-2 size-4 hidden md:block" /> Diet
            </TabsTrigger>
            <TabsTrigger value="strength" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent">
              <Dumbbell className="mr-2 size-4 hidden md:block" /> Strength
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Personal Information</CardTitle>
                <CardDescription>Core physiological data for baseline calculations.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="28" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="72" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" placeholder="178" className="bg-secondary/50" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="running" className="mt-6 space-y-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Performance Metrics (VDOT)</CardTitle>
                <CardDescription>Essential values for training zone calibration.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    VO2 Max / VDOT
                    <Info className="ml-2 size-3 text-muted-foreground" />
                  </Label>
                  <Input defaultValue="54.2" className="bg-secondary/50 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Threshold Pace (T-Pace)</Label>
                  <Input defaultValue="6:45 min/mi" className="bg-secondary/50 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Resting HR (bpm)</Label>
                  <Input defaultValue="48" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Max HR (bpm)</Label>
                  <Input defaultValue="188" className="bg-secondary/50" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diet" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Nutritional Strategy</CardTitle>
                <CardDescription>Current phase: Lean Bulking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50 text-center border">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Daily Calories</div>
                    <div className="text-xl font-bold font-headline">2,850</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 text-center border">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Protein</div>
                    <div className="text-xl font-bold font-headline">165g</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 text-center border">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Carbs</div>
                    <div className="text-xl font-bold font-headline">380g</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strength" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Strength PRs</CardTitle>
                <CardDescription>Tracking explosive and compound movements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { lift: "Back Squat", weight: "110kg", date: "Oct 12, 2024" },
                  { lift: "Deadlift", weight: "145kg", date: "Sep 28, 2024" },
                  { lift: "Weighted Pullups", weight: "BW + 25kg", date: "Oct 05, 2024" },
                ].map((item) => (
                  <div key={item.lift} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                        <Dumbbell className="size-5" />
                      </div>
                      <div>
                        <div className="font-bold">{item.lift}</div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-accent font-headline">{item.weight}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
