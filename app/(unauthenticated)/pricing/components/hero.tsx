'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import NumberFlow from '@number-flow/react';
import {
  CheckIcon,
  CloverIcon,
  Flower2Icon,
  FlowerIcon,
  LeafIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type HeroProps = {
  userId?: string | undefined;
  currentPlan?: string | undefined;
};

export const Hero = ({ userId, currentPlan }: HeroProps) => {
  const [yearly, setYearly] = useState(true);

  const plans = useMemo(
    () => [
      {
        icon: LeafIcon,
        name: 'Free',
        description: 'For personal use',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: {
          ai: false,
          'advanced-ai': false,
        },
        ctaLink: '/signup',
        ctaText: userId ? 'Manage' : 'Get Started',
      },
      {
        icon: FlowerIcon,
        name: 'Hobby',
        description: 'For hobbyists',
        monthlyPrice: 10,
        yearlyPrice: 8,
        features: {
          ai: true,
          'advanced-ai': false,
        },
        ctaLink: '/signup',
        ctaText: userId ? 'Upgrade' : 'Get Started',
      },
      {
        icon: CloverIcon,
        name: 'Pro',
        description: 'For professional use',
        monthlyPrice: 16,
        yearlyPrice: 12,
        features: {
          ai: true,
          'advanced-ai': true,
        },
        ctaLink: '/signup',
        ctaText: userId ? 'Upgrade' : 'Get Started',
      },
      {
        icon: Flower2Icon,
        name: 'Enterprise',
        description: 'For large scale use',
        monthlyPrice: -1,
        yearlyPrice: -1,
        features: {
          ai: true,
          'advanced-ai': true,
        },
        ctaLink: '/signup',
        ctaText: userId ? 'Upgrade' : 'Get Started',
      },
    ],
    [userId]
  );

  return (
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
        <div className="flex flex-col items-center justify-center px-5 py-16">
          <h1 className="mb-5 text-center font-medium text-4xl tracking-[-0.12rem] md:text-6xl">
            Simple,{' '}
            <span className="mr-1 font-semibold font-serif text-5xl italic md:text-7xl">
              transparent
            </span>{' '}
            pricing
          </h1>

          <p className="max-w-2xl text-center text-muted-foreground tracking-[-0.01rem] sm:text-lg">
            Tersa is an open source canvas for building AI workflows. Drag, drop
            connect and run nodes to build your own workflows powered by various
            industry-leading AI models.
          </p>

          {/* Pricing Toggle */}
          <div className="mt-16 flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm ${yearly ? 'text-muted-foreground' : 'font-medium text-primary'}`}
              >
                Monthly
              </span>
              <Switch
                checked={yearly}
                onCheckedChange={setYearly}
                className="data-[state=checked]:bg-primary"
              />
              <span
                className={`text-sm ${yearly ? 'font-medium text-primary' : 'text-muted-foreground'}`}
              >
                Yearly{' '}
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
                  Save 20%
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-dotted" />
      {/* Bottom row - Plans */}
      <div className="border-b border-dotted" />
      <div className="relative flex items-center justify-center border-x border-b border-dotted">
        {/* Corner decorations */}
        <div className="-bottom-[3px] -left-[3px] absolute">
          <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
        </div>
        <div className="-bottom-[3px] -right-[3px] absolute">
          <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
        </div>

        {/* Pricing Cards */}
        <div className="grid w-full grid-cols-1 divide-x divide-dotted md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.name} className="p-12">
              <Card key={plan.name} className="border-none p-0 shadow-none">
                <CardHeader className="p-0">
                  <div className="inline-flex w-fit items-center justify-center rounded bg-primary/10 p-3">
                    <plan.icon size={16} className="text-primary" />
                  </div>
                  <CardTitle className="mt-4">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-0">
                  {plan.monthlyPrice === -1 ? (
                    <div className="mb-4 h-[45px]">
                      <span className="font-bold text-3xl">Custom</span>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="font-bold text-3xl">
                        <NumberFlow
                          value={yearly ? plan.yearlyPrice : plan.monthlyPrice}
                          format={{
                            currency: 'USD',
                            style: 'currency',
                          }}
                        />
                      </span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                  )}

                  <ul className="space-y-2">
                    {Object.entries(plan.features).map(([feature, enabled]) => (
                      <li key={feature} className="flex items-center gap-2">
                        {enabled ? (
                          <CheckIcon size={16} className="text-primary" />
                        ) : (
                          <XIcon size={16} className="text-muted-foreground" />
                        )}
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-0">
                  <Button className="w-full" asChild>
                    <Link href={plan.ctaLink}>{plan.ctaText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <div className="border-b border-dotted" />
      <div className="h-16" />
      <div className="border-x border-dotted" />
      <div className="" />
    </div>
  );
};
