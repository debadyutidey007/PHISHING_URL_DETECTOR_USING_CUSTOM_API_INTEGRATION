'use server';
/**
 * @fileOverview This file implements a Genkit flow for detecting phishing URLs.
 *
 * The flow accepts a URL as input and returns a prediction indicating whether the URL is phishing or legitimate,
 * along with a confidence score and a highly detailed analysis report.
 *
 * @exports phishingUrlDetector - The main function to detect phishing URLs.
 * @exports PhishingUrlDetectorInput - The input type for the phishingUrlDetector function.
 * @exports PhishingUrlDetectorOutput - The output type for the phishingUrlDetector function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PhishingUrlDetectorInputSchema = z.object({
  url: z.string().describe('The URL to check for phishing.'),
});
export type PhishingUrlDetectorInput = z.infer<typeof PhishingUrlDetectorInputSchema>;

const PhishingUrlDetectorOutputSchema = z.object({
  prediction: z.enum(['phishing', 'legitimate']).describe('The final verdict on whether the URL is phishing or legitimate.'),
  confidenceScore: z.number().min(0).max(1).describe('The confidence score of the prediction (0-1).'),
  overallAssessment: z.string().describe("A concise, one-sentence summary of the findings."),
  
  threatCategorization: z.object({
      category: z.enum(['Credential Harvesting', 'Malware Delivery', 'Social Engineering', 'Financial Scam', 'Benign']).describe("The specific type of threat identified."),
      description: z.string().describe("A detailed explanation of the threat category and why this URL fits into it."),
  }).describe("Categorization of the detected threat."),

  detailedAnalysis: z.object({
      domainAnalysis: z.string().describe("In-depth analysis of the domain, including age (heuristic), TLD, and similarities to legitimate domains."),
      subdomainAnalysis: z.string().describe("Examination of subdomains for suspicious patterns like brand impersonation or excessive length."),
      pathAnalysis: z.string().describe("Scrutiny of the URL path for red flags like '.exe' or attempts to look like a legitimate login page."),
      characterAnalysis: z.string().describe("Analysis of URL characters for suspicious patterns (e.g., excessive hyphens, special characters, Punycode)."),
  }).describe("A breakdown of the URL's components."),
  
  securityChecklist: z.object({
    usesHttps: z.object({
      value: z.boolean(),
      assessment: z.string().describe("Assessment of whether the site uses HTTPS and the implications."),
    }).describe("Checks for HTTPS encryption."),
    sslCertificate: z.object({
      valid: z.boolean(),
      assessment: z.string().describe("Analysis of the SSL certificate's validity and trustworthiness (simulated)."),
    }).describe("Checks the SSL certificate status."),
    domainReputation: z.object({
      status: z.enum(['good', 'neutral', 'poor', 'unknown']),
      assessment: z.string().describe("Assessment of the domain's reputation based on public blacklists and historical data (simulated)."),
    }).describe("Evaluates the domain's reputation."),
  }).describe("A checklist of critical security indicators."),

  actionableRecommendations: z.object({
    userAction: z.enum(['Do Not Proceed', 'Proceed with Caution', 'Safe to Proceed']).describe("The recommended course of action for the user."),
    securityTip: z.string().describe("A practical security tip for the user based on the analysis."),
  }).describe("Provides clear guidance for the user."),

});
export type PhishingUrlDetectorOutput = z.infer<typeof PhishingUrlDetectorOutputSchema>;

export async function phishingUrlDetector(input: PhishingUrlDetectorInput): Promise<PhishingUrlDetectorOutput> {
  return phishingUrlDetectorFlow(input);
}

const detectPhishingPrompt = ai.definePrompt({
  name: 'detectPhishingPrompt',
  input: {schema: PhishingUrlDetectorInputSchema},
  output: {schema: PhishingUrlDetectorOutputSchema},
  prompt: `You are a world-class cybersecurity analyst AI, specializing in the forensic analysis of URLs to detect sophisticated phishing attempts. Your analysis must be exceptionally detailed, providing deep insights and actionable advice.

Analyze the URL: {{{url}}}

Based on your comprehensive analysis, generate a structured JSON output with the following highly detailed fields:

- **prediction**: Your final verdict ("phishing" or "legitimate").
- **confidenceScore**: A score from 0.0 to 1.0 representing your confidence.
- **overallAssessment**: A concise, one-sentence executive summary of your findings.
- **threatCategorization**:
  - **category**: Classify the threat ('Credential Harvesting', 'Malware Delivery', 'Social Engineering', 'Financial Scam', or 'Benign').
  - **description**: Provide a detailed explanation of this threat type and the specific evidence within the URL that supports your classification.
- **detailedAnalysis**:
  - **domainAnalysis**: Analyze the main domain. Comment on its likely age (is it a newly registered domain?), the TLD's common usage, and any subtle misspellings or impersonations of well-known brands.
  - **subdomainAnalysis**: Scrutinize all subdomains. Look for brand names, random character strings, or excessive subdomains designed to obscure the true domain.
  - **pathAnalysis**: Examine the URL path. Look for suspicious file extensions (e.g., .zip, .exe), directory names that mimic legitimate services ('/login/', '/account/verify/'), or long, obfuscated paths.
  - **characterAnalysis**: Analyze the URL for Punycode (IDN homograph attacks), excessive use of hyphens or dots, and the presence of special characters used to deceive users.
- **securityChecklist**:
  - **usesHttps**:
    - **value**: boolean (true if HTTPS is used, false otherwise).
    - **assessment**: Explain the significance of HTTPS (or its absence) for this specific URL. Note that HTTPS does not guarantee safety.
  - **sslCertificate**:
    - **valid**: boolean (simulate this check; assume true for HTTPS sites unless other factors are highly suspicious).
    - **assessment**: Briefly assess the SSL certificate's role in trust. Mention if a phishing site can still have a valid certificate.
  - **domainReputation**:
    - **status**: 'good', 'neutral', 'poor', or 'unknown' (simulate this check based on URL patterns).
    - **assessment**: Provide a judgment on the domain's reputation, explaining what factors led to this conclusion.
- **actionableRecommendations**:
  - **userAction**: Your explicit advice: 'Do Not Proceed', 'Proceed with Caution', or 'Safe to Proceed'.
  - **securityTip**: Offer a relevant, practical security tip that educates the user based on the findings (e.g., "Always verify the sender before clicking links in emails.").
`,
});

const phishingUrlDetectorFlow = ai.defineFlow(
  {
    name: 'phishingUrlDetectorFlow',
    inputSchema: PhishingUrlDetectorInputSchema,
    outputSchema: PhishingUrlDetectorOutputSchema,
  },
  async input => {
    const {output} = await detectPhishingPrompt(input);
    return output!;
  }
);
