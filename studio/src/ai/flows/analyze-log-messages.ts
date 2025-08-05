'use server';

/**
 * @fileOverview Analyzes ModSecurity log messages to detect common attack signatures,
 * provide a description, and suggest recommendations.
 *
 * - analyzeLogMessage - A function that analyzes a log message and returns a detailed analysis.
 * - AnalyzeLogMessageInput - The input type for the analyzeLogMessage function.
 * - AnalyzeLogMessageOutput - The return type for the analyzeLogMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLogMessageInputSchema = z.object({
  logMessage: z
    .string()
    .describe('The ModSecurity log message to analyze.'),
});
export type AnalyzeLogMessageInput = z.infer<typeof AnalyzeLogMessageInputSchema>;

const AttackAnalysisSchema = z.object({
    attackType: z.string().describe("The type of attack detected (e.g., SQL Injection, XSS). If no attack is detected, this should be 'No Attack Detected'."),
    description: z.string().describe("A brief explanation of what the attack is, why the given log message indicates such an attack, and what potential impact it could have."),
    recommendation: z.string().describe("A concrete suggestion on how to prevent this type of attack at the application level (e.g., 'Use parameterized queries for database access')."),
});

const AnalyzeLogMessageOutputSchema = z.object({
  analysis: AttackAnalysisSchema.optional().describe('The detailed analysis of the attack. Will be undefined if there is an error.'),
});
export type AnalyzeLogMessageOutput = z.infer<typeof AnalyzeLogMessageOutputSchema>;

export async function analyzeLogMessage(input: AnalyzeLogMessageInput): Promise<AnalyzeLogMessageOutput> {
  return analyzeLogMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLogMessagePrompt',
  input: {schema: AnalyzeLogMessageInputSchema},
  output: {schema: AnalyzeLogMessageOutputSchema},
  prompt: `You are a security expert analyzing ModSecurity log messages for attack signatures.

  Analyze the following log message and provide a detailed analysis.
  The analysis should include the attack type, a description of the attack and why this log indicates it, and a recommendation for how to fix the underlying vulnerability at the application code level.

  Log Message: {{{logMessage}}}

  If no specific attack is found, set the attackType to 'No Specific Attack Detected' and provide a general description.
  `,
});

const analyzeLogMessageFlow = ai.defineFlow(
  {
    name: 'analyzeLogMessageFlow',
    inputSchema: AnalyzeLogMessageInputSchema,
    outputSchema: AnalyzeLogMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
