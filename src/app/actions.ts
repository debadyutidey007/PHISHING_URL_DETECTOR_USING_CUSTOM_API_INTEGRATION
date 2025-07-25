'use server';

import { phishingUrlDetector, PhishingUrlDetectorOutput } from '@/ai/flows/phishing-url-detector';
import { z } from 'zod';

const formSchema = z.object({
  url: z.string({
    required_error: "URL is required.",
  }).url("Please enter a valid URL."),
  apiKey: z.string().min(1, "API Key is required."),
  apiKeys: z.string().optional(), // From localStorage, as a stringified JSON
});

export type FormState = {
  result?: PhishingUrlDetectorOutput;
  error?: string;
  success: boolean;
  message?: string;
  url?: string;
  apiKey?: string;
}

export async function checkPhishingUrl(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = formSchema.safeParse({
      url: formData.get('url'),
      apiKey: formData.get('apiKey'),
      apiKeys: formData.get('apiKeys'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors.map((e) => e.message).join(', '),
      };
    }

    const { url, apiKey, apiKeys } = validatedFields.data;

    let storedKeys: { key: string; createdAt: string; expiresIn: number; }[] = [];
    if (apiKeys) {
        try {
            storedKeys = JSON.parse(apiKeys);
        } catch (e) {
            // ignore parse error
        }
    }

    const foundKey = storedKeys.find(k => k.key === apiKey);

    if (!foundKey) {
        return { success: false, error: 'Invalid API Key provided.' };
    }

    if (foundKey.expiresIn > 0) {
        const creationDate = new Date(foundKey.createdAt);
        const expirationDate = new Date(creationDate.getTime() + foundKey.expiresIn * 1000);
        if (new Date() > expirationDate) {
            return { success: false, error: 'API Key has expired.' };
        }
    }


    const result = await phishingUrlDetector({ url });

    return { 
      success: true,
      result,
      url,
      apiKey
    };

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { 
      success: false,
      error: `Analysis failed: ${errorMessage}` 
    };
  }
}
