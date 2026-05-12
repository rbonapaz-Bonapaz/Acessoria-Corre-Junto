"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Droplets, BookOpen, Clock, Zap } from "lucide-react";

export default function UtilitiesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-headline font-bold">Support Utility Suite</h1>
          <p className="text-muted-foreground">Specialized tools for strategy, hydration, and technical terminology.</p>
        </header>

        <Tabs defaultValue="pace" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary rounded-xl p-1 h-12">
            <TabsTrigger value="pace" className="rounded-lg">
              <Calculator className="mr-2 size-4" /> Pace Calc
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="rounded-lg">
              <Droplets className="mr-2 size-4" /> Nutrition
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="rounded-lg">
              <BookOpen className="mr-2 size-4" /> Dictionary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pace" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Race Predictor & Pace Splitting</CardTitle>
                <CardDescription>Calculate splits based on target time and distance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Distance</Label>
                    <Input defaultValue="Marathon" className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Time</Label>
                    <Input defaultValue="3:15:00" className="bg-secondary/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input defaultValue="miles" className="bg-secondary/50" />
                  </div>
                </div>

                <div className="rounded-2xl border bg-secondary/20 p-6 overflow-hidden">
                  <h4 className="font-headline font-bold mb-4 flex items-center gap-2">
                    <Clock className="size-4 text-accent" /> Recommended Pace: 7:26/mi
                  </h4>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    {[5, 10, 15, 20, 25, 30, 35, 42.2].map(km => (
                      <div key={km} className="text-center space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{km}k</div>
                        <div className="text-xs font-mono font-bold">{(km * 4.6).toFixed(1)}m</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Intra-Race Fueling Strategy</CardTitle>
                <CardDescription>Hydration and carbohydrate intake planning.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Zap className="size-4 text-accent" /> Carb Intake
                    </h4>
                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Target Per Hour</span>
                        <span className="font-bold">60-90g</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Gels (Marathon)</span>
                        <span className="font-bold">6 - 8 units</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Timing Interval</span>
                        <span className="font-bold">Every 35-45 min</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Droplets className="size-4 text-accent" /> Fluid Intake
                    </h4>
                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Base Rate</span>
                        <span className="font-bold">500-700ml / hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sodium Target</span>
                        <span className="font-bold">300-600mg / hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sweat Rate Guess</span>
                        <span className="font-bold text-accent">Moderate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dictionary" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Runner's Dictionary</CardTitle>
                <CardDescription>Scientific terms and athletic abbreviations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { term: "VDOT", def: "A method to calculate your running ability and training paces based on a race result." },
                    { term: "T-Pace", def: "Threshold Pace. The intensity at which your body can just clear as much lactate as it produces." },
                    { term: "GCT", def: "Ground Contact Time. The amount of time your foot spends on the ground during each stride." },
                    { term: "Supercompensation", def: "The post-training period during which the trained function has a higher performance capacity than prior to the training." },
                  ].map(item => (
                    <div key={item.term} className="p-4 rounded-xl border bg-secondary/20 hover:border-accent/50 transition-colors">
                      <div className="font-bold font-headline text-accent">{item.term}</div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.def}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
