'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { UploadCloud, File as FileIcon, Loader2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { generateMetadataAction } from '@/app/upload/actions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { SuggestMetadataOutput } from '@/ai/flows/suggest-metadata-from-content';
import { Skeleton } from './ui/skeleton';

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestMetadataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileProcessing = useCallback((selectedFile: File) => {
    if (!selectedFile) return;
    
    // Reset previous state
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setPreviewUrl(null);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

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
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const fileDataUri = reader.result as string;
      try {
        const response = await generateMetadataAction({ fileDataUri, fileName: file.name });
        if (response.error) {
          throw new Error(response.error);
        }
        setResult(response.data || null);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setIsLoading(false);
      setError('Failed to read file.');
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
    setResult(null);
    setError(null);
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
            <p className="text-sm text-muted-foreground">Any file type (max 5MB)</p>
          </div>
        </div>
        <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} />
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
            <Button variant="ghost" size="icon" onClick={handleReset} aria-label="Remove file">
              <X className="h-5 w-5" />
            </Button>
            <Button onClick={handleSubmit}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderLoadingView = () => (
     <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </CardContent>
        </Card>
      </div>
  );

  const renderResultView = () => result && (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-headline text-2xl font-bold">Analysis Complete</h2>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Suggested Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea defaultValue={result.description} readOnly rows={4} className="bg-secondary/50" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Suggested Tags</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? renderLoadingView() : (
        result ? renderResultView() : (
          file ? renderFilePreview() : renderInitialView()
        )
      )}
    </div>
  );
}
