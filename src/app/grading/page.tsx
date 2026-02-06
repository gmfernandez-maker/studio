'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Gem, Scale, Sparkles, Star, Search, Info } from 'lucide-react';
import type { SuggestMetadataOutput } from '@/ai/flows/suggest-metadata-from-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const GradingSkeleton = () => (
    <div className="container mx-auto px-4 py-12 md:py-16 animate-pulse">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-8">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    </div>
);


export default function GradingPage() {
  const [result, setResult] = useState<SuggestMetadataOutput | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedResult = sessionStorage.getItem('jewelryGradeResult');
      const storedPreview = sessionStorage.getItem('jewelryPreviewUrl');
      
      if (storedResult && storedPreview) {
        setResult(JSON.parse(storedResult));
        setPreviewUrl(storedPreview);
      } else {
        router.replace('/upload');
      }
    } catch (error) {
        console.error("Failed to read from session storage", error);
        router.replace('/upload');
    }
  }, [router]);

  if (!result || !previewUrl) {
    return <GradingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" onClick={() => router.push('/upload')} className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Grade Another
        </Button>

        <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-8">
                <Card className="overflow-hidden shadow-2xl">
                    <CardContent className="p-0">
                        <div className="relative aspect-[4/3]">
                            <Image src={previewUrl} alt="Graded Jewelry" fill className="object-cover" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Info className="h-5 w-5 text-accent" />
                           AI Gemologist's Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{result.analysis}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
                <Card className="bg-gradient-to-br from-card to-secondary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            Overall Quality Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-4">
                        <div className="relative w-full">
                            <Progress value={result.qualityScore} className="h-4" />
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-foreground">
                                {result.qualityScore} / 100
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scale className="h-5 w-5 text-accent" />
                            Material & Purity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Material:</span>
                                <span className="font-bold">{result.material}</span>
                            </div>
                            {result.purity && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Purity:</span>
                                    <span className="font-bold">{result.purity}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {result.gemstones && result.gemstones.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gem className="h-5 w-5 text-accent" />
                                Gemstone Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Cut</TableHead>
                                        <TableHead>Clarity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.gemstones.map((gem, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{gem.type}</TableCell>
                                            <TableCell>{gem.cut || 'N/A'}</TableCell>
                                            <TableCell>{gem.clarity || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>

        {result.similarProducts && result.similarProducts.length > 0 && (
            <div className="mt-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-center mb-8">
                    <Search className="inline-block mr-2 h-7 w-7 text-accent" />
                    Similar Products Found Online
                </h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: result.similarProducts.length > 2,
                    }}
                    className="w-full max-w-6xl mx-auto"
                >
                    <CarouselContent>
                        {result.similarProducts.map((product, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="h-full overflow-hidden flex flex-col">
                                        <CardContent className="p-0 flex flex-col flex-grow">
                                            <div className="relative aspect-square">
                                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <div className="p-4 flex flex-col flex-grow">
                                                <h3 className="font-semibold truncate flex-grow">{product.name}</h3>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-lg font-bold text-primary">{product.price}</p>
                                                    <Button asChild size="sm">
                                                        <Link href={product.url} target="_blank" rel="noopener noreferrer">
                                                            View
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        )}
    </div>
  );
}
