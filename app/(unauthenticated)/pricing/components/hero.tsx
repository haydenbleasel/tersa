"use client";

import NumberFlow from "@number-flow/react";
import {
  BrainIcon,
  CoinsIcon,
  FlowerIcon,
  LifeBuoyIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type HeroProps = {
  currentPlan?: "pro" | undefined;
  authenticated: boolean;
};

export const Hero = ({ currentPlan, authenticated }: HeroProps) => {
  const [yearly, setYearly] = useState(false);

  const getCtaLink = () => {
    if (currentPlan === "pro") {
      return "/api/portal";
    }
    if (authenticated) {
      return `/api/checkout?product=pro&frequency=${yearly ? "year" : "month"}`;
    }
    return "/auth/sign-up";
  };

  const getCtaText = () => {
    if (currentPlan === "pro") {
      return "Manage";
    }
    return "Get Started";
  };

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
            Simple,{" "}
            <span className="mr-1 font-semibold font-serif text-5xl italic md:text-7xl">
              transparent
            </span>{" "}
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
                className={`text-sm ${yearly ? "text-muted-foreground" : "font-medium text-primary"}`}
              >
                Monthly
              </span>
              <Switch
                checked={yearly}
                className="data-[state=checked]:bg-primary"
                onCheckedChange={setYearly}
              />
              <span
                className={`text-sm ${yearly ? "font-medium text-primary" : "text-muted-foreground"}`}
              >
                Yearly{" "}
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
                  Save 20%
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-dotted" />
      {/* Bottom row - Plan */}
      <div className="border-b border-dotted" />
      <div className="relative flex items-center justify-center border-x border-b border-dotted">
        {/* Corner decorations */}
        <div className="-bottom-[3px] -left-[3px] absolute">
          <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
        </div>
        <div className="-bottom-[3px] -right-[3px] absolute">
          <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
        </div>

        {/* Pricing Card */}
        <div className="flex w-full max-w-md justify-center p-12">
          <Card className="h-full w-full rounded-none border-none bg-transparent p-0 shadow-none">
            <CardHeader className="p-0">
              <div className="inline-flex w-fit items-center justify-center rounded bg-primary/10 p-3">
                <FlowerIcon className="text-primary" size={16} />
              </div>
              <CardTitle className="mt-4 font-medium text-xl">Pro</CardTitle>
              <CardDescription>
                For professional use or small teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0">
              <div className="mb-4">
                <span className="font-medium text-3xl tracking-tight">
                  <NumberFlow
                    format={{
                      currency: "USD",
                      style: "currency",
                      maximumFractionDigits: 0,
                    }}
                    value={yearly ? 8 : 10}
                  />
                </span>
                <span className="text-muted-foreground">
                  /mo, billed {yearly ? "annually" : "monthly"}
                </span>
              </div>

              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CoinsIcon className="text-primary" size={16} />
                  <span className="text-sm">1600 credits / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <BrainIcon className="text-primary" size={16} />
                  <span className="text-sm">All AI models</span>
                </li>
                <li className="flex items-center gap-2">
                  <LifeBuoyIcon className="text-primary" size={16} />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <UsersIcon className="text-primary" size={16} />
                  <span className="text-sm">
                    Live collaboration{" "}
                    <Badge variant="secondary">Coming soon</Badge>
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto p-0">
              <Button asChild className="w-full" variant="default">
                <Link href={getCtaLink()}>{getCtaText()}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="border-b border-dotted" />
      <div className="h-16" />
      <div className="border-x border-dotted" />
      <div className="" />
    </div>
  );
};
