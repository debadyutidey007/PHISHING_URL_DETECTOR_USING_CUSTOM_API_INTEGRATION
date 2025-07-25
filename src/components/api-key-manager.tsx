"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, PlusCircle, Trash2, Copy, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";


const createKeySchema = z.object({
  key: z.string().min(8, "API Key must be at least 8 characters long."),
  sharingCode: z.string().optional(),
  expiresIn: z.string(),
});

const importKeySchema = z.object({
    key: z.string().min(1, "API Key is required."),
    sharingCode: z.string().min(1, "Sharing Code is required."),
    expiresIn: z.string(),
});

type CreateKeyFormValues = z.infer<typeof createKeySchema>;
type ImportKeyFormValues = z.infer<typeof importKeySchema>;

type StoredApiKey = {
  key: string;
  sharingCode?: string;
  createdAt: string;
  expiresIn: number; // in seconds, 0 for never
};

const expirationOptions = [
  { value: "3600", label: "1 Hour" },
  { value: "86400", label: "1 Day" },
  { value: "604800", label: "7 Days" },
  { value: "0", label: "Never" },
];

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<StoredApiKey[]>([]);
  const { toast } = useToast();

  const createForm = useForm<CreateKeyFormValues>({
    resolver: zodResolver(createKeySchema),
    defaultValues: {
      key: "",
      sharingCode: "",
      expiresIn: "86400",
    },
  });

  const importForm = useForm<ImportKeyFormValues>({
      resolver: zodResolver(importKeySchema),
      defaultValues: {
          key: "",
          sharingCode: "",
          expiresIn: "86400",
      },
  });

  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem("apiKeys");
      if (storedKeys) {
        setApiKeys(JSON.parse(storedKeys));
      }
    } catch (error) {
      console.error("Failed to load API keys from localStorage", error);
    }
  }, []);

  const saveKeysToLocalStorage = (keys: StoredApiKey[]) => {
    try {
      localStorage.setItem("apiKeys", JSON.stringify(keys));
      setApiKeys(keys);
    } catch (error) {
      console.error("Failed to save API keys to localStorage", error);
      toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Could not save API keys to your browser's local storage.",
      });
    }
  };

  const handleCreateSubmit: SubmitHandler<CreateKeyFormValues> = (data) => {
    if (apiKeys.some(k => k.key === data.key)) {
      toast({
        variant: "destructive",
        title: "Duplicate Key",
        description: "This API key already exists. Please choose a unique key.",
      });
      return;
    }

    const newKey: StoredApiKey = {
      key: data.key,
      sharingCode: data.sharingCode,
      createdAt: new Date().toISOString(),
      expiresIn: parseInt(data.expiresIn, 10),
    };
    const updatedKeys = [...apiKeys, newKey];
    saveKeysToLocalStorage(updatedKeys);
    toast({
      title: "API Key Created",
      description: "Your new API key has been saved.",
    });
    createForm.reset({ key: "", sharingCode: "", expiresIn: "86400" });
  };

  const handleImportSubmit: SubmitHandler<ImportKeyFormValues> = (data) => {
    if (apiKeys.some(k => k.key === data.key)) {
      toast({
        variant: "destructive",
        title: "Duplicate Key",
        description: "This API key already exists in your list.",
      });
      return;
    }

    const newKey: StoredApiKey = {
      key: data.key,
      sharingCode: data.sharingCode,
      createdAt: new Date().toISOString(),
      expiresIn: parseInt(data.expiresIn, 10),
    };
    const updatedKeys = [...apiKeys, newKey];
    saveKeysToLocalStorage(updatedKeys);
    toast({
      title: "API Key Imported",
      description: "The shared API key has been added to your list.",
    });
    importForm.reset({ key: "", sharingCode: "", expiresIn: "86400" });
  };

  const deleteKey = (keyToDelete: string) => {
    const updatedKeys = apiKeys.filter((k) => k.key !== keyToDelete);
    saveKeysToLocalStorage(updatedKeys);
    toast({
      title: "API Key Deleted",
      description: "The API key has been removed.",
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API Key copied to clipboard.",
    });
  }

  const getExpirationDate = (createdAt: string, expiresIn: number) => {
    if (expiresIn === 0) return "Never";
    const expiration = new Date(new Date(createdAt).getTime() + expiresIn * 1000);
    const isExpired = new Date() > expiration;
    if(isExpired) return "Expired";
    return expiration.toLocaleString();
  };
  
  const isKeyExpired = (createdAt: string, expiresIn: number) => {
    if (expiresIn === 0) return false;
    const expiration = new Date(new Date(createdAt).getTime() + expiresIn * 1000);
    return new Date() > expiration;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Tabs defaultValue="create" className="w-full md:col-span-1">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Key</TabsTrigger>
                <TabsTrigger value="import">Import Key</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
                 <Card className="transition-all hover:shadow-lg">
                    <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PlusCircle className="w-6 h-6" /> Create API Key
                        </CardTitle>
                        <CardDescription>
                            Create a new API key. Add a sharing code to securely share it with others.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <FormField
                            control={createForm.control}
                            name="key"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>API Key</FormLabel>
                                <FormControl>
                                <Input placeholder="Enter your new API key" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={createForm.control}
                            name="sharingCode"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sharing Code (Optional)</FormLabel>
                                <FormControl>
                                <Input placeholder="Enter a code to share this key" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={createForm.control}
                            name="expiresIn"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Expires In</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select expiration" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {expirationOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </CardContent>
                        <CardFooter>
                        <Button type="submit" className="w-full">
                            Create Key
                        </Button>
                        </CardFooter>
                    </form>
                    </Form>
                </Card>
            </TabsContent>
            <TabsContent value="import">
                <Card className="transition-all hover:shadow-lg">
                    <Form {...importForm}>
                    <form onSubmit={importForm.handleSubmit(handleImportSubmit)}>
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="w-6 h-6" /> Import Shared Key
                        </CardTitle>
                        <CardDescription>
                            Enter an API key and its sharing code that someone has given you.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <FormField
                            control={importForm.control}
                            name="key"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>API Key</FormLabel>
                                <FormControl>
                                <Input placeholder="Enter the shared API key" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={importForm.control}
                            name="sharingCode"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sharing Code</FormLabel>
                                <FormControl>
                                <Input placeholder="Enter the required sharing code" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={importForm.control}
                            name="expiresIn"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Expires In</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select expiration" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {expirationOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </CardContent>
                        <CardFooter>
                        <Button type="submit" className="w-full">
                            Import Key
                        </Button>
                        </CardFooter>
                    </form>
                    </Form>
                </Card>
            </TabsContent>
        </Tabs>
     

      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-6 h-6" /> Your API Keys
          </CardTitle>
          <CardDescription>
            These are the keys stored in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.key} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                         <span>{`${apiKey.key.substring(0, 4)}...${apiKey.key.substring(apiKey.key.length - 4)}`}</span>
                         {apiKey.sharingCode && <Badge variant="outline">Shared</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isKeyExpired(apiKey.createdAt, apiKey.expiresIn) ? "destructive" : apiKey.expiresIn === 0 ? "secondary" : "outline"}>
                        {getExpirationDate(apiKey.createdAt, apiKey.expiresIn)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => copyKey(apiKey.key)}>
                          <Copy className="h-4 w-4" />
                       </Button>
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteKey(apiKey.key)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
              You haven't created any API keys yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
