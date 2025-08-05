'use server';

import { analyzeLogMessage, AnalyzeLogMessageOutput } from '@/ai/flows/analyze-log-messages';

export async function getAttackSignature(
  logMessage: string
): Promise<AnalyzeLogMessageOutput> {
  try {
    const result = await analyzeLogMessage({ logMessage });
    if (!result.analysis) {
        return {
            analysis: {
                attackType: 'AI Analysis Failed',
                description: 'The AI was unable to analyze the log message. Please check the server logs for more details.',
                recommendation: 'Ensure the Genkit service is running and the API key is correctly configured.'
            }
        };
    }
    return result;
  } catch (error) {
    console.error('Error analyzing log message:', error);
    return {
       analysis: {
         attackType: 'Error',
         description: 'An unexpected error occurred while communicating with the AI service.',
         recommendation: 'Please check the server logs for more details.',
       }
    };
  }
}
