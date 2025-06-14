import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

type HeroProps = {
  announcement?: {
    title: string;
    link: string;
  };
  buttons: {
    title: string;
    link: string;
  }[];
};

export const Hero = ({ announcement, buttons }: HeroProps) => (
  <div className="relative grid w-full grid-cols-[0.2fr_3fr_0.2fr] md:grid-cols-[0.5fr_3fr_0.5fr]">
    {/* Gradient overlays */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute top-0 right-0 left-0 h-8 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>

    {/* Top row */}
    <div className="border-b border-dotted" />
    <div className="border-x border-b border-dotted py-6" />
    <div className="border-b border-dotted" />

    {/* Middle row - main content */}
    <div className="border-b border-dotted" />
    <div className="relative flex items-center justify-center border-x border-b border-dotted">
      {/* Corner decorations */}
      <div className="-left-[3px] -top-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-right-[3px] -top-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-bottom-[3px] -left-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-bottom-[3px] -right-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center px-5 py-8">
        {announcement && (
          <Link
            href={announcement.link}
            className="relative inline-flex items-center justify-between gap-2 rounded-full border px-4 py-1.5 text-sm tracking-[-0.01rem] transition-all duration-300 ease-in-out hover:border-primary hover:bg-primary/5 hover:text-primary"
            target={announcement.link.startsWith('http') ? '_blank' : '_self'}
            rel={
              announcement.link.startsWith('http')
                ? 'noopener noreferrer'
                : undefined
            }
          >
            {announcement.title}
            <ArrowRightIcon size={16} />
          </Link>
        )}

        <h1 className="mt-6 mb-5 text-center font-medium text-4xl tracking-[-0.12rem] md:text-6xl">
          A
          <span className="mx-1 font-semibold font-serif text-5xl italic md:text-7xl">
            visual
          </span>{' '}
          AI playground
        </h1>

        <p className="max-w-2xl text-center text-muted-foreground tracking-[-0.01rem] sm:text-lg">
          Tersa is an open source canvas for building AI workflows. Drag, drop
          connect and run nodes to build your own workflows powered by various
          industry-leading AI models.
        </p>
      </div>
    </div>
    <div className="border-b border-dotted" />

    {/* Bottom row - buttons */}
    <div className="border-b border-dotted" />
    <div className="relative flex items-center justify-center border-x border-b border-dotted">
      {/* Corner decorations */}
      <div className="-bottom-[3px] -left-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-bottom-[3px] -right-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center justify-center gap-4 py-10 md:flex-row">
        {buttons.map((button, index) => (
          <Button
            key={button.title}
            variant={index === 0 ? 'default' : 'outline'}
            asChild
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href={button.link}>{button.title}</Link>
          </Button>
        ))}
      </div>
    </div>
    <div className="border-b border-dotted" />

    {/* Spacer */}
    <div className="h-16" />
    <div className="border-x border-dotted" />
    <div className="" />
  </div>
);
