"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import { checkPhishingUrl, FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Lock, Search, ShieldCheck, CheckCircle2, XCircle, Globe, ListChecks, Lightbulb, Siren, ServerCrash } from "lucide-react";
import { Separator } from "./ui/separator";
import { PhishingUrlDetectorOutput } from "@/ai/flows/phishing-url-detector";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL."),
  apiKey: z.string().min(1, "API Key is required."),
});

type HistoryItem = {
    id: string;
    url: string;
    apiKey: string;
    result: PhishingUrlDetectorOutput;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analyzing...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Analyze URL
        </>
      )}
    </Button>
  );
}

const DetailCard = ({ title, children, icon, delay = 0 }: { title: string, children: React.ReactNode, icon: React.ReactNode, delay?: number }) => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${delay}ms`}}>
        <div className="p-4">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-primary">
                {icon}
                {title}
            </h4>
        </div>
        <div className="p-4 pt-0 space-y-3 text-sm text-muted-foreground">
            {children}
        </div>
    </div>
);

const DetailItem = ({ title, value }: { title: string, value: string | undefined }) => (
    <div>
        <p className="font-semibold text-card-foreground">{title}</p>
        <p>{value || 'N/A'}</p>
    </div>
);

const ChecklistItem = ({ title, value, assessment }: { title: string, value: boolean, assessment: string }) => (
    <div>
        <div className="flex items-center gap-2">
            {value ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            <p className="font-semibold text-card-foreground">{title}</p>
        </div>
        <p className="pl-7 text-xs">{assessment}</p>
    </div>
);

const AnalysisResultDisplay = ({ result }: { result: PhishingUrlDetectorOutput }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-lg font-semibold">
                <span>Prediction</span>
                <Badge
                    variant={result.prediction === "phishing" ? "destructive" : "default"}
                    className="text-base"
                >
                    {result.prediction === "phishing" ? (
                        <AlertTriangle className="mr-2 h-4 w-4" />
                    ) : (
                        <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    {result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)}
                </Badge>
            </div>

            <div className="space-y-2">
                <Label>Confidence Score</Label>
                <div className="flex items-center gap-4">
                    <Progress value={result.confidenceScore * 100} className="w-full" />
                    <span className="font-mono text-lg font-semibold">
                        {(result.confidenceScore * 100).toFixed(0)}%
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Overall Assessment</Label>
                <div className="p-3 bg-muted rounded-lg border">
                    <p className="text-sm text-muted-foreground italic">
                        {result.overallAssessment}
                    </p>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <DetailCard title="Threat Categorization" icon={<Siren className="w-5 h-5" />} delay={100}>
                    <DetailItem title="Category" value={result.threatCategorization.category} />
                    <DetailItem title="Description" value={result.threatCategorization.description} />
                </DetailCard>

                <DetailCard title="URL Breakdown" icon={<Globe className="w-5 h-5" />} delay={200}>
                    <DetailItem title="Domain Analysis" value={result.detailedAnalysis.domainAnalysis} />
                    <DetailItem title="Subdomain Analysis" value={result.detailedAnalysis.subdomainAnalysis} />
                    <DetailItem title="Path Analysis" value={result.detailedAnalysis.pathAnalysis} />
                    <DetailItem title="Character Analysis" value={result.detailedAnalysis.characterAnalysis} />
                </DetailCard>

                <DetailCard title="Security Checklist" icon={<ListChecks className="w-5 h-5" />} delay={300}>
                    <ChecklistItem title="Uses HTTPS" value={result.securityChecklist.usesHttps.value} assessment={result.securityChecklist.usesHttps.assessment} />
                    <ChecklistItem title="Valid SSL Certificate" value={result.securityChecklist.sslCertificate.valid} assessment={result.securityChecklist.sslCertificate.assessment} />
                    <ChecklistItem title="Domain Reputation" value={result.securityChecklist.domainReputation.status === 'good'} assessment={`${result.securityChecklist.domainReputation.status.charAt(0).toUpperCase() + result.securityChecklist.domainReputation.status.slice(1)} - ${result.securityChecklist.domainReputation.assessment}`} />
                </DetailCard>

                <DetailCard title="Actionable Recommendations" icon={<Lightbulb className="w-5 h-5" />} delay={400}>
                    <DetailItem title="Recommended Action" value={result.actionableRecommendations.userAction} />
                    <DetailItem title="Security Tip" value={result.actionableRecommendations.securityTip} />
                </DetailCard>
            </div>
        </div>
    );
};

export default function Detector() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<string>("[]"); // Stored as stringified JSON
  
  const initialState: FormState = { success: false };
  const [state, formAction] = useActionState(checkPhishingUrl, initialState);

  useEffect(() => {
    // Load api keys from localStorage on initial render
    try {
        const storedApiKeys = localStorage.getItem("apiKeys");
        if (storedApiKeys) {
            setApiKeys(storedApiKeys);
        }
    } catch (error) {
        console.error("Failed to load api keys from localStorage", error);
    }
  }, []);

  useEffect(() => {
    // Load history from localStorage on initial render
    try {
        const storedHistory = localStorage.getItem("analysisHistory");
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    } catch (error) {
        console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: state.error,
      });
    }
    if (state.success && state.result && state.url && state.apiKey) {
        const newHistoryItem: HistoryItem = {
            id: new Date().toISOString(),
            url: state.url,
            apiKey: state.apiKey,
            result: state.result
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        try {
            localStorage.setItem("analysisHistory", JSON.stringify(updatedHistory));
        } catch(error) {
            console.error("Failed to save history to localStorage", error);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success, state.error, state.result]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Card className="transition-all hover:shadow-lg">
          <form
            ref={formRef}
            action={formAction}
            className="flex flex-col h-full"
          >
            <CardHeader>
              <CardTitle>URL Phishing Detector</CardTitle>
              <CardDescription>
                Enter a URL and an API key to check if it's a phishing site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <div className="space-y-2">
                <Label htmlFor="url">URL to Analyze</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com"
                  required
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="apiKey"
                    name="apiKey"
                    placeholder="Your-API-Key"
                    required
                    type="password"
                    className="pl-10"
                  />
                </div>
              </div>
              <input type="hidden" name="apiKeys" value={apiKeys} />
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>

      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>
            A detailed report from our model will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {useFormStatus().pending ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Separator />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : state.result ? (
            <AnalysisResultDisplay result={state.result} />
          ) : (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-4 border-2 border-dashed rounded-lg h-full">
                <ServerCrash className="w-16 h-16" />
                <p className="text-lg font-medium">No results yet</p>
                <p className="text-sm">Submit a URL to start the detailed analysis.</p>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
