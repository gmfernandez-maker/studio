import { UploadForm } from '@/components/upload-form';

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-accent md:text-4xl">
          Upload Your Jewelry for Grading
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Upload an image of your jewelry to receive a detailed grading report, including material analysis, gemstone identification, quality score, and more.
        </p>
      </div>
      <div className="mt-12">
        <UploadForm />
      </div>
    </div>
  );
}
