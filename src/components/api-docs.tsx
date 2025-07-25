
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check, Server, Shield, FileJson, ArrowRight, BookUser } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-semibold text-primary mt-6 mb-3 flex items-center gap-2">
        <ArrowRight className="w-4 h-4" />
        {children}
    </h3>
);

const SchemaProperty = ({ name, type, description, required }: { name: string, type: string, description: string, required?: boolean }) => (
    <div className="py-2">
        <div className="flex items-center gap-2">
            <code className="text-sm font-semibold font-mono text-primary">{name}</code>
            <span className="text-xs text-muted-foreground font-mono">{type}</span>
            {required && <Badge variant="outline" className="text-orange-500 border-orange-500">Required</Badge>}
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-1">{description}</p>
    </div>
);

const CodeSnippet = ({ code, language }: { code: string, language: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: '0.5rem' }}>
                {code.trim()}
            </SyntaxHighlighter>
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-7 w-7 opacity-50 group-hover:opacity-100"
                onClick={handleCopy}
            >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
        </div>
    );
};

export default function ApiDocs() {
    const detectResponse = `{
  "prediction": "phishing",
  "confidenceScore": 0.98,
  "overallAssessment": "...",
  "threatCategorization": {
    "category": "Credential Harvesting",
    "description": "..."
  },
  "detailedAnalysis": {
    "domainAnalysis": "...",
    "subdomainAnalysis": "...",
    "pathAnalysis": "...",
    "characterAnalysis": "..."
  },
  "securityChecklist": {
    "usesHttps": { "value": true, "assessment": "..." },
    "sslCertificate": { "valid": true, "assessment": "..." },
    "domainReputation": { "status": "poor", "assessment": "..." }
  },
  "actionableRecommendations": {
    "userAction": "Do Not Proceed",
    "securityTip": "..."
  }
}`;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <BookUser className="w-8 h-8 text-primary" />
                    <span>API Documentation</span>
                </CardTitle>
                <p className="text-muted-foreground !mt-2 max-w-2xl">
                    Welcome to the PhishNet API. Here you'll find all the information you need to integrate our phishing detection capabilities into your applications.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid md:grid-cols-12">
                    <div className="md:col-span-4 p-6 border-r">
                        <h2 className="text-lg font-semibold mb-4">Endpoints</h2>
                        <div className="flex items-center justify-between p-3 rounded-md bg-primary/10 border-l-4 border-primary">
                            <span className="font-mono text-sm font-medium text-primary">/api/detect</span>
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 h-6">POST</Badge>
                        </div>
                    </div>
                    <div className="md:col-span-8 p-6">
                        <section>
                            <h2 className="text-2xl font-bold">Detect Phishing URL</h2>
                            <p className="text-muted-foreground mt-2">
                                Analyzes a given URL and returns a detailed prediction on whether it is a phishing attempt. This is the primary endpoint of the service.
                            </p>

                            <SectionTitle>Authentication</SectionTitle>
                            <div className="p-4 rounded-lg bg-muted/50 border flex items-start gap-4">
                                <Shield className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold">API Key Required</h4>
                                    <p className="text-sm text-muted-foreground">You must include an API key in the <code className="font-mono text-xs bg-muted p-1 rounded-sm">x-api-key</code> header of your request.</p>
                                </div>
                            </div>
                            
                            <SectionTitle>Request Details</SectionTitle>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="p-4 bg-muted/30">
                                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">POST</Badge>
                                    <code className="ml-2 font-mono text-sm">/api/detect</code>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <h5 className="font-semibold mb-2 flex items-center gap-2"><FileJson className="w-4 h-4" />Request Body</h5>
                                        <SchemaProperty name="url" type="string" description="The complete URL to be analyzed for phishing threats." required />
                                    </div>
                                </div>
                            </div>

                            <SectionTitle>Example Request</SectionTitle>
                            <Tabs defaultValue="curl" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="curl">cURL</TabsTrigger>
                                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                    <TabsTrigger value="python">Python</TabsTrigger>
                                </TabsList>
                                <TabsContent value="curl" className="mt-4">
                                    <CodeSnippet language="bash" code={`
curl -X POST 'https://your-api-domain.com/api/detect' 
--header 'x-api-key: YOUR_API_KEY' 
--header 'Content-Type: application/json' 
--data-raw '{
  "url": "http://example-phishing-site.com/login"
}'
                                    `} />
                                </TabsContent>
                                <TabsContent value="javascript" className="mt-4">
                                     <CodeSnippet language="javascript" code={`
const url = 'https://your-api-domain.com/api/detect';
const options = {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'http://example-phishing-site.com/login'
  })
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));
                                    `} />
                                </TabsContent>
                                <TabsContent value="python" className="mt-4">
                                     <CodeSnippet language="python" code={`
import requests
import json

url = 'https://your-api-domain.com/api/detect'
headers = {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
}
payload = {
    'url': 'http://example-phishing-site.com/login'
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(response.json())
                                    `} />
                                </TabsContent>
                            </Tabs>

                            <SectionTitle>Response Schema</SectionTitle>
                            <p className="text-sm text-muted-foreground mb-4">A successful request returns a comprehensive JSON object with the full analysis.</p>
                            <div className="border rounded-lg divide-y">
                                <SchemaProperty name="prediction" type="enum" description="'phishing' or 'legitimate'." />
                                <SchemaProperty name="confidenceScore" type="number" description="A score from 0.0 to 1.0 representing prediction confidence." />
                                <SchemaProperty name="overallAssessment" type="string" description="A one-sentence executive summary of the findings." />
                                <SchemaProperty name="threatCategorization" type="object" description="Categorization of the detected threat." />
                                <SchemaProperty name="detailedAnalysis" type="object" description="A breakdown of the URL's components." />
                                <SchemaProperty name="securityChecklist" type="object" description="A checklist of critical security indicators." />
                                <SchemaProperty name="actionableRecommendations" type="object" description="Provides clear guidance for the user." />
                            </div>
                            
                            <SectionTitle>Example Response (200 OK)</SectionTitle>
                             <CodeSnippet language="json" code={detectResponse} />
                        </section>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}