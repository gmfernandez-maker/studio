import { UploadForm } from '@/components/upload-form';

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-accent md:text-4xl">
          Upload Your Gold
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Drop an image of your Jewelry and have it graded through our image processing and analyzation pipeline.
        </p>
      </div>
      <div className="mt-12">
        <UploadForm />
      </div>
    </div>
  );
}
