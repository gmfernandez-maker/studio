import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'homepage-hero');

  return (
    <div className="min-h-[calc(100vh-81px)] w-full">
      <section className="container mx-auto flex h-full flex-col items-center justify-center px-4 py-12 md:py-24">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start text-left">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-accent md:text-5xl lg:text-6xl">
              Unlock Your Content's Potential.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground md:text-xl">
              Welcome to <span className="font-bold text-foreground">FileFlow</span>. Seamlessly organize your files by letting our AI generate smart, relevant metadata for you.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/upload">
                Upload Your First File <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-2xl md:h-96">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          </div>
        </div>
      </section>
    </div>
  );
}
