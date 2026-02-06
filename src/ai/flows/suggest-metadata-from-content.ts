'use server';
/**
 * @fileOverview An AI agent that grades jewelry from an image and suggests similar products.
 *
 * - suggestMetadata - A function that handles the jewelry grading process.
 * - SuggestMetadataInput - The input type for the suggestMetadata function.
 * - SuggestMetadataOutput - The return type for the suggestMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMetadataInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A photo of a piece of jewelry, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the uploaded file.'),
});
export type SuggestMetadataInput = z.infer<typeof SuggestMetadataInputSchema>;

const SuggestMetadataOutputSchema = z.object({
    material: z.string().describe('The primary material of the jewelry, e.g., Gold, Silver, Platinum.'),
    purity: z.string().optional().describe('The purity of the material, e.g., 18k, 24k, .925.'),
    gemstones: z.array(z.object({
      type: z.string().describe('The type of gemstone, e.g., Diamond, Ruby.'),
      cut: z.string().optional().describe('The cut of the gemstone, e.g., Round, Princess.'),
      clarity: z.string().optional().describe('The clarity of the gemstone.'),
    })).optional().describe('A list of gemstones found in the jewelry.'),
    qualityScore: z.number().min(0).max(100).describe('An overall quality score for the jewelry from 0 to 100.'),
    analysis: z.string().describe('A detailed analysis of the jewelry piece, explaining the grade.'),
    similarProducts: z.array(z.object({
        name: z.string().describe('The name of a similar product.'),
        url: z.string().url().describe('A URL to a similar product.'),
        price: z.string().describe('The price of the similar product.'),
        imageUrl: z.string().url().describe('An image URL for the similar product.')
    })).optional().describe('A list of similar products found online.')
});
export type SuggestMetadataOutput = z.infer<typeof SuggestMetadataOutputSchema>;

export async function suggestMetadata(input: SuggestMetadataInput): Promise<SuggestMetadataOutput> {
  return suggestMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMetadataPrompt',
  input: {schema: SuggestMetadataInputSchema},
  output: {schema: SuggestMetadataOutputSchema},
  prompt: `You are a world-renowned gemologist and jewelry appraiser. Your task is to analyze the provided image of a piece of jewelry and provide a detailed grading report.

  Analyze the image carefully. Based on your expert knowledge, determine the following:
  - The primary material of the jewelry (e.g., Gold, Silver, Platinum).
  - The purity of the material, if discernible (e.g., 18k, .925).
  - Identify all visible gemstones, their type, cut, and clarity.
  - Provide an overall quality score on a scale of 0-100, where 100 is a flawless, high-value piece.
  - Write a detailed analysis explaining your grading, mentioning the craftsmanship, style, and potential value drivers.
  - Find 3 similar products available for sale online. Provide their name, URL, price, and image URL. For the imageUrl, use an image from \`images.unsplash.com\` if possible.

  Present your findings in the structured format required.

  File Name: {{{fileName}}}
  Photo: {{media url=fileDataUri}}`,
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
