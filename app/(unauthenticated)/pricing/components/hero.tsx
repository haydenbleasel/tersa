'use client';

import { Badge } from '@/components/ui/badge';
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
  BrainIcon,
  CoinsIcon,
  Flower2Icon,
  FlowerIcon,
  LeafIcon,
  LifeBuoyIcon,
  LockIcon,
  type LucideIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { type ComponentProps, type ReactNode, useMemo, useState } from 'react';

type HeroProps = {
  currentPlan?: 'hobby' | 'pro' | undefined;
};

type Plan = {
  icon: LucideIcon;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: {
    label: ReactNode;
    icon: LucideIcon;
  }[];
  ctaLink: string;
  ctaText: string;
  variant: ComponentProps<typeof Button>['variant'];
};

export const Hero = ({ currentPlan }: HeroProps) => {
  const [yearly, setYearly] = useState(false);

  const plans = useMemo(() => {
    const free: Plan = {
      icon: LeafIcon,
      name: 'Hobby',
      description: 'For personal use and testing.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        {
          label: '100 credits / month',
          icon: CoinsIcon,
        },
        {
          label: 'Basic AI models',
          icon: BrainIcon,
        },
        {
          label: 'General support',
          icon: LifeBuoyIcon,
        },
        {
          label: 'Single user',
          icon: UserIcon,
        },
      ],
      ctaLink: `/api/checkout?product=hobby&frequency=${yearly ? 'year' : 'month'}`,
      ctaText: 'Get Started',
      variant: 'outline',
    };

    const pro: Plan = {
      icon: FlowerIcon,
      name: 'Pro',
      description: 'For professional use or small teams.',
      monthlyPrice: 8,
      yearlyPrice: 6,
      features: [
        {
          label: '1600 credits / month',
          icon: CoinsIcon,
        },
        {
          label: 'All AI models',
          icon: BrainIcon,
        },
        {
          label: 'Priority support',
          icon: LifeBuoyIcon,
        },
        {
          label: (
            <>
              Live collaboration <Badge variant="secondary">Coming soon</Badge>
            </>
          ),
          icon: UsersIcon,
        },
      ],
      variant: 'outline',
      ctaLink: `/api/checkout?product=pro&frequency=${yearly ? 'year' : 'month'}`,
      ctaText: 'Get Started',
    };

    const enterprise: Plan = {
      icon: Flower2Icon,
      name: 'Enterprise',
      description: 'For large teams or enterprise use.',
      monthlyPrice: -1,
      yearlyPrice: -1,
      features: [
        {
          label: 'Unlimited credits',
          icon: CoinsIcon,
        },
        {
          label: 'Custom AI models',
          icon: BrainIcon,
        },
        {
          label: 'Dedicated support',
          icon: LifeBuoyIcon,
        },
        {
          label: 'Custom authentication',
          icon: LockIcon,
        },
      ],
      ctaLink: '/contact',
      ctaText: 'Get in Touch',
      variant: 'outline',
    };

    if (currentPlan === 'hobby') {
      free.ctaText = 'Manage';
      pro.ctaText = 'Upgrade';
      pro.variant = 'default';
    } else if (currentPlan === 'pro') {
      pro.ctaText = 'Manage';
      free.ctaText = 'Downgrade';
      enterprise.variant = 'default';
    } else if (currentPlan === 'enterprise') {
      enterprise.ctaText = 'Manage';
      free.ctaText = 'Downgrade';
      pro.ctaText = 'Downgrade';
    }

    return [free, pro, enterprise];
  }, [currentPlan, yearly]);

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

          <p className="max-w-3xl text-center text-muted-foreground tracking-[-0.01rem] sm:text-lg">
            Tersa uses a flat fee and overage pricing model. This means you pay
            a flat monthly cost which includes a certain amount of credits. If
            you exceed your credits, you just pay for the extra usage.
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
        <div className="grid w-full grid-cols-1 divide-x divide-dotted xl:grid-cols-3">
          {plans.map((plan, planIndex) => (
            <div key={plan.name} className="p-12">
              <Card
                key={plan.name}
                className="h-full rounded-none border-none bg-transparent p-0 shadow-none"
              >
                <CardHeader className="p-0">
                  <div className="inline-flex w-fit items-center justify-center rounded bg-primary/10 p-3">
                    <plan.icon size={16} className="text-primary" />
                  </div>
                  <CardTitle className="mt-4 font-medium text-xl">
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-0">
                  {plan.monthlyPrice === -1 && (
                    <div className="mb-4 h-[45px]">
                      <span className="font-medium text-3xl tracking-tight">
                        Custom
                      </span>
                    </div>
                  )}

                  {plan.monthlyPrice === 0 && (
                    <div className="mb-4 h-[45px]">
                      <span className="font-medium text-3xl tracking-tight">
                        Free
                      </span>
                    </div>
                  )}

                  {plan.monthlyPrice > 0 && (
                    <div className="mb-4">
                      <span className="font-medium text-3xl tracking-tight">
                        <NumberFlow
                          value={yearly ? plan.yearlyPrice : plan.monthlyPrice}
                          format={{
                            currency: 'USD',
                            style: 'currency',
                          }}
                        />
                      </span>
                      <span className="text-muted-foreground">
                        /mo, billed {yearly ? 'annually' : 'monthly'}
                      </span>
                    </div>
                  )}

                  {planIndex > 0 && (
                    <p className="mb-2 text-muted-foreground text-sm">
                      Everything in {plans[planIndex - 1].name}, plus:
                    </p>
                  )}

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.label}
                        className="flex items-center gap-2"
                      >
                        {feature.icon ? (
                          <feature.icon size={16} className="text-primary" />
                        ) : (
                          <XIcon size={16} className="text-muted-foreground" />
                        )}
                        <span className="text-sm">{feature.label}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto p-0">
                  <Button className="w-full" variant={plan.variant} asChild>
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
