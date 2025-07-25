"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, Server, BrainCircuit, Zap, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";


const StatusIndicator = ({ status, text, icon: Icon }: { status: 'healthy' | 'degraded' | 'down', text: string, icon: React.ElementType }) => {
  const colorClasses = {
    healthy: "text-green-500",
    degraded: "text-yellow-500",
    down: "text-red-500",
  };
  const ringColorClasses = {
    healthy: "bg-green-500",
    degraded: "bg-yellow-500",
    down: "bg-red-500",
  };
  return (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${colorClasses[status]}`} />
            <span className="font-medium">{text}</span>
        </div>
        <div className="flex items-center gap-2">
            <div className={`relative flex h-2.5 w-2.5`}>
              <div className={`absolute inline-flex h-full w-full rounded-full ${ringColorClasses[status]} opacity-75 animate-ping`}></div>
              <div className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ringColorClasses[status]}`}></div>
            </div>
            <span className={`text-sm font-semibold ${colorClasses[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
    </div>
  );
};


export default function Health() {
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    // Simulate latency fluctuation for a more dynamic feel
    const interval = setInterval(() => {
        setLatency(Math.floor(Math.random() * (65 - 30 + 1)) + 30);
    }, 2000);
    setLatency(Math.floor(Math.random() * (65 - 30 + 1)) + 30); // initial value
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-primary" />
          <span>Health Status</span>
        </CardTitle>
        <CardDescription>
          Real-time status of all PhishHunter API systems.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-muted/50 border flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                    <p className="text-lg font-semibold text-primary">All Systems Operational</p>
                    <p className="text-xs text-muted-foreground">Last updated just now</p>
                </div>
           </div>
           <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">99.99% Uptime</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary border-b pb-2">Core Components</h4>
                <div className="space-y-3">
                    <StatusIndicator status="healthy" text="API Server" icon={Server} />
                    <StatusIndicator status="healthy" text="AI Model Endpoint" icon={BrainCircuit} />
                </div>
            </div>
            
            <div className="space-y-4 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary border-b pb-2">Performance Metrics</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">API Latency</span>
                        </div>
                        <span className="font-mono font-semibold">{latency}ms</span>
                    </div>
                     <div>
                        <Progress value={latency} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Fast</span>
                            <span>Slow</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Separator />
        
        <div className="text-center text-xs text-muted-foreground">
            This page automatically updates. No need to refresh.
        </div>
      </CardContent>
    </Card>
  );
}
