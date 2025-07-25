import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck } from "lucide-react"
import Detector from "@/components/detector"
import ApiDocs from "@/components/api-docs"
import Health from "@/components/health"
import Version from "@/components/version"
import ApiKeyManager from "@/components/api-key-manager"
import History from "@/components/history"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-background font-body animate-in fade-in duration-500">
      <div className="w-full max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text">
            <ShieldCheck className="h-10 w-10 text-primary" />
            PhishHunter API
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Phishing URL Detection Service
          </p>
        </header>

        <Tabs defaultValue="detector" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
            <TabsTrigger value="detector">Detector</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="apiKeys">API Keys</TabsTrigger>
            <TabsTrigger value="docs">API Docs</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="version">Version</TabsTrigger>
          </TabsList>
          <TabsContent value="detector">
            <Detector />
          </TabsContent>
          <TabsContent value="history">
            <History />
          </TabsContent>
          <TabsContent value="apiKeys">
            <ApiKeyManager />
          </TabsContent>
          <TabsContent value="docs">
            <ApiDocs />
          </TabsContent>
          <TabsContent value="health">
            <Health />
          </TabsContent>
          <TabsContent value="version">
            <Version />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
