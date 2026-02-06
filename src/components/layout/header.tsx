import Link from 'next/link';
import { Logo } from '@/components/icons/logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <span className="text-2xl font-bold text-foreground font-headline">
            FileFlow
          </span>
        </Link>
      </div>
    </header>
  );
}
