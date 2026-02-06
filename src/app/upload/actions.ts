'use server';

import { suggestMetadata, type SuggestMetadataOutput } from '@/ai/flows/suggest-metadata-from-content';

type ActionResult = {
  data?: SuggestMetadataOutput;
  error?: string;
};

type ActionInput = {
    fileDataUri: string;
    fileName: string;
}

export async function generateMetadataAction(
  { fileDataUri, fileName }: ActionInput
): Promise<ActionResult> {
  
  if (!fileDataUri || !fileName) {
    return { error: 'Invalid input. File data and name are required.' };
  }

  try {
    const result = await suggestMetadata({
      fileDataUri,
      fileName,
    });
    return { data: result };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `AI metadata generation failed: ${errorMessage}` };
  }
}
