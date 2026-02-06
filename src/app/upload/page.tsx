import { UploadForm } from '@/components/upload-form';

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-accent md:text-4xl">
          Upload Your Content
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Drop a file below and watch as our AI analyzes it to suggest a fitting description and relevant tags.
        </p>
      </div>
      <div className="mt-12">
        <UploadForm />
      </div>
    </div>
  );
}
