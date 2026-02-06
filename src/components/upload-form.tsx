'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UploadCloud, File as FileIcon, Loader2, X } from 'lucide-react';
import { generateMetadataAction } from '@/app/upload/actions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileProcessing = useCallback((selectedFile: File) => {
    if (!selectedFile) return;
    
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setPreviewUrl(url);
      try {
        sessionStorage.setItem('jewelryPreviewUrl', url);
      } catch (e) {
        console.error('Failed to save preview URL to session storage', e);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not prepare image for grading. Your browser storage might be full.',
        });
      }
    };
    reader.readAsDataURL(selectedFile);
  }, [toast]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileProcessing(event.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>, dragState: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragState);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDrag(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !previewUrl) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const fileDataUri = reader.result as string;
      try {
        const response = await generateMetadataAction({ fileDataUri, fileName: file.name });
        if (response.error) {
          throw new Error(response.error);
        }
        try {
            sessionStorage.setItem('jewelryGradeResult', JSON.stringify(response.data));
        } catch (e) {
            console.error('Failed to save result to session storage', e);
            throw new Error('Could not save grading result. Your browser storage might be full.');
        }
        router.push('/grading');
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to read file.',
      });
    };
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsLoading(false);
    sessionStorage.removeItem('jewelryPreviewUrl');
    sessionStorage.removeItem('jewelryGradeResult');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const renderInitialView = () => (
    <Card 
      className={cn(
        "border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
      )}
      onDragEnter={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDragOver={(e) => handleDrag(e, true)}
      onDrop={handleDrop}
    >
      <CardContent className="p-6">
        <div
          className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer h-64"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-lg font-medium">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-muted-foreground">Image of your jewelry (max 5MB)</p>
          </div>
        </div>
        <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
      </CardContent>
    </Card>
  );

  const renderFilePreview = () => file && (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {previewUrl ? (
              <Image src={previewUrl} alt="File preview" width={64} height={64} className="rounded-md object-cover" />
            ) : (
              <FileIcon className="h-12 w-12 text-muted-foreground" />
            )}
            <div className="truncate">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleReset} aria-label="Remove file" disabled={isLoading}>
              <X className="h-5 w-5" />
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !previewUrl}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Grade Jewelry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-3xl">
      {file ? renderFilePreview() : renderInitialView()}
    </div>
  );
}
