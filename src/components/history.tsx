"use client"

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { History as HistoryIcon, Download, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Globe, ListChecks, Lightbulb, Siren, Trash2, Filter } from "lucide-react";
import { PhishingUrlDetectorOutput } from "@/ai/flows/phishing-url-detector";
import { generatePdf, generateBulkPdf } from "@/lib/pdf-generator";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HistoryItem = {
    id: string;
    url: string;
    apiKey: string;
    result: PhishingUrlDetectorOutput;
};

type StoredApiKey = {
  key: string;
  createdAt: string;
  expiresIn: number;
};

const DetailCard = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
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
        <div className="space-y-6">
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
                <DetailCard title="Threat Categorization" icon={<Siren className="w-5 h-5" />}>
                    <DetailItem title="Category" value={result.threatCategorization.category} />
                    <DetailItem title="Description" value={result.threatCategorization.description} />
                </DetailCard>

                <DetailCard title="URL Breakdown" icon={<Globe className="w-5 h-5" />}>
                    <DetailItem title="Domain Analysis" value={result.detailedAnalysis.domainAnalysis} />
                    <DetailItem title="Subdomain Analysis" value={result.detailedAnalysis.subdomainAnalysis} />
                    <DetailItem title="Path Analysis" value={result.detailedAnalysis.pathAnalysis} />
                    <DetailItem title="Character Analysis" value={result.detailedAnalysis.characterAnalysis} />
                </DetailCard>

                <DetailCard title="Security Checklist" icon={<ListChecks className="w-5 h-5" />}>
                    <ChecklistItem title="Uses HTTPS" value={result.securityChecklist.usesHttps.value} assessment={result.securityChecklist.usesHttps.assessment} />
                    <ChecklistItem title="Valid SSL Certificate" value={result.securityChecklist.sslCertificate.valid} assessment={result.securityChecklist.sslCertificate.assessment} />
                    <ChecklistItem title="Domain Reputation" value={result.securityChecklist.domainReputation.status === 'good'} assessment={`${result.securityChecklist.domainReputation.status.charAt(0).toUpperCase() + result.securityChecklist.domainReputation.status.slice(1)} - ${result.securityChecklist.domainReputation.assessment}`} />
                </DetailCard>

                <DetailCard title="Actionable Recommendations" icon={<Lightbulb className="w-5 h-5" />}>
                    <DetailItem title="Recommended Action" value={result.actionableRecommendations.userAction} />
                    <DetailItem title="Security Tip" value={result.actionableRecommendations.securityTip} />
                </DetailCard>
            </div>
        </div>
    );
};


export default function History() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [predictionFilter, setPredictionFilter] = useState("all"); // 'all', 'phishing', 'legitimate'
    const [apiKeyFilter, setApiKeyFilter] = useState("all");
    const [availableApiKeys, setAvailableApiKeys] = useState<StoredApiKey[]>([]);
    const { toast } = useToast();
    
    const loadHistory = () => {
        try {
            const storedHistory = localStorage.getItem("analysisHistory");
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
            const storedApiKeys = localStorage.getItem("apiKeys");
            if (storedApiKeys) {
                setAvailableApiKeys(JSON.parse(storedApiKeys));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load analysis history or API keys.",
            });
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    // Listen for storage changes to update history across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "analysisHistory" || e.key === "apiKeys") {
                loadHistory();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const deleteHistoryItem = (id: string) => {
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem("analysisHistory", JSON.stringify(updatedHistory));
        toast({
            title: "History Item Deleted",
            description: "The selected analysis has been removed from your history.",
        });
    };

    const clearAllHistory = () => {
        setHistory([]);
        localStorage.removeItem("analysisHistory");
        toast({
            title: "History Cleared",
            description: "All analysis history has been deleted.",
        });
    };

    const filteredHistory = history.filter(item => {
        const predictionMatch = predictionFilter === "all" || item.result.prediction === predictionFilter;
        const apiKeyMatch = apiKeyFilter === "all" || item.apiKey === apiKeyFilter;
        return predictionMatch && apiKeyMatch;
    });

    return (
        <Card className="transition-all hover:shadow-lg">
            <CardHeader>
                <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex items-center gap-2">
                         <HistoryIcon className="w-6 h-6" />
                        <CardTitle>Analysis History</CardTitle>
                    </div>
                    {history.length > 0 && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => generateBulkPdf(filteredHistory)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download All
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear All
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your entire
                                            analysis history from your browser's storage.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={clearAllHistory}>
                                            Yes, delete everything
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
                <CardDescription>
                    Review your past analysis results. This history is saved in your browser.
                </CardDescription>
            </CardHeader>
            
            <div className="px-6 pb-4">
                <div className="flex flex-wrap items-center gap-4 p-2 rounded-lg bg-muted border">
                     <div className="flex items-center gap-2 text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        <span>Filter by:</span>
                     </div>
                     <Select value={predictionFilter} onValueChange={setPredictionFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] h-9">
                            <SelectValue placeholder="Select prediction" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Predictions</SelectItem>
                            <SelectItem value="phishing">Phishing</SelectItem>
                            <SelectItem value="legitimate">Legitimate</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={apiKeyFilter} onValueChange={setApiKeyFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] h-9">
                           <SelectValue placeholder="Select API Key" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All API Keys</SelectItem>
                            {availableApiKeys.map(k => (
                                <SelectItem key={k.key} value={k.key}>{`${k.key.substring(0,4)}...${k.key.substring(k.key.length - 4)}`}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <CardContent>
                {filteredHistory.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {filteredHistory.map((item) => (
                            <AccordionItem value={item.id} key={item.id}>
                                <AccordionTrigger>
                                    <div className="flex flex-col items-start text-left w-full overflow-hidden">
                                      <span className="font-semibold break-all w-full text-left">{item.url}</span>
                                      <span className="text-xs text-muted-foreground mt-1">
                                          Prediction: <span className={item.result.prediction === 'phishing' ? 'text-destructive' : 'text-green-600'}>{item.result.prediction}</span>
                                      </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 animate-in fade-in duration-300">
                                  <div className="flex justify-between items-center">
                                      <div>
                                          <p className="text-sm font-medium">API Key Used</p>
                                          <p className="text-xs text-muted-foreground font-mono">{`${item.apiKey.substring(0,4)}...${item.apiKey.substring(item.apiKey.length - 4)}`}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => generatePdf(item.result, item.url, item.apiKey)}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            PDF
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this history item?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete the analysis for <span className="font-bold break-all">{item.url}</span>? This action cannot be undone.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteHistoryItem(item.id)}
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                  </div>
                                  <Separator />
                                  <AnalysisResultDisplay result={item.result} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <p>No analysis history found for the selected filter.</p>
                        <p className="text-sm">Your past analysis results will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
