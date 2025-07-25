import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

export default function Version() {
  const apiVersion = "1.0.0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-primary" />
          API Version
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold font-mono text-primary">{apiVersion}</p>
        <p className="text-sm text-muted-foreground mt-2">
          This is the current version of the PhishHunter API.
        </p>
      </CardContent>
    </Card>
  );
}
