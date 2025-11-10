'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequestSubscriptionLink } from '@/lib/services/SubscriptionService';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/xano/auth-context';

type PricingCardProps = {
  title: string;
  price: string;
  annualPrice?: string;
  description: string;
  features: string[];
  annualPriceID: string;
  monthlyPriceID: string;
  buttonText: string;
  buttonHref: string;
  isPopular?: boolean;
  isAnnual?: boolean;
  highlight?: string;
};

export function PricingCard(props: PricingCardProps) {
  const displayPrice = props.isAnnual && props.annualPrice ? props.annualPrice : props.price;

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  console.log(user);
  const handleSubscriptionLink = async () => {
    try {
      const response = await apiRequestSubscriptionLink({
        price_id: props.isAnnual ? props.annualPriceID : props.monthlyPriceID,
        company_id: user?.company_id || 0,
        plan: props.title.toLowerCase() as 'pro' | 'max' | 'enterprise' | 'agency',
      });
      window.open(response.url);
    } catch (error) {
      console.error('Failed to create subscription link:', error);
    }
  };
  return (
    <Card
      className={`w-full max-w-sm relative ${props.isPopular ? 'border-primary border-2 shadow-lg' : ''}`}
    >
      {props.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">{displayPrice}</span>
          <span className="text-muted-foreground">/month</span>
          {props.isAnnual && props.annualPrice && (
            <p className="text-sm text-muted-foreground mt-1">Billed annually (save 2 months)</p>
          )}
        </div>
        {props.highlight && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">{props.highlight}</p>
          </div>
        )}
        <ul className="space-y-3">
          {props.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="mr-2 h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubscriptionLink}
          variant={props.isPopular ? 'default' : 'outline'}
          className="w-full"
        >
          {props.buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PricingGrid(props: {
  title: string;
  subtitle: string;
  items: PricingCardProps[];
  className?: string;
}) {
  return (
    <section className={`container space-y-6 py-8 md:py-12 lg:py-24 ${props.className || ''}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center space-y-4 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold">{props.title}</h2>
        <p className="max-w-[85%] text-muted-foreground sm:text-lg">{props.subtitle}</p>
      </div>

      <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:max-w-7xl mt-8">
        {props.items.map((item, index) => (
          <PricingCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}
