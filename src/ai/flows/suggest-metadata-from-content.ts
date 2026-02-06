'use server';
/**
 * @fileOverview An AI agent that suggests metadata (tags, descriptions) for uploaded files.
 *
 * - suggestMetadata - A function that handles the metadata suggestion process.
 * - SuggestMetadataInput - The input type for the suggestMetadata function.
 * - SuggestMetadataOutput - The return type for the suggestMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMetadataInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The uploaded file's data, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the uploaded file.'),
});
export type SuggestMetadataInput = z.infer<typeof SuggestMetadataInputSchema>;

const SuggestMetadataOutputSchema = z.object({
  tags: z.array(z.string()).describe('Suggested tags for the file.'),
  description: z.string().describe('A suggested description for the file.'),
});
export type SuggestMetadataOutput = z.infer<typeof SuggestMetadataOutputSchema>;

export async function suggestMetadata(input: SuggestMetadataInput): Promise<SuggestMetadataOutput> {
  return suggestMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMetadataPrompt',
  input: {schema: SuggestMetadataInputSchema},
  output: {schema: SuggestMetadataOutputSchema},
  prompt: `You are an AI assistant that helps users categorize their uploaded files by suggesting relevant metadata.

  Based on the content of the uploaded file, generate a list of tags and a description that accurately reflect the file's content.

  File Name: {{{fileName}}}
  File Content: {{media url=fileDataUri}}
  
  Tags: 
  Description:`,
});

const suggestMetadataFlow = ai.defineFlow(
  {
    name: 'suggestMetadataFlow',
    inputSchema: SuggestMetadataInputSchema,
    outputSchema: SuggestMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
