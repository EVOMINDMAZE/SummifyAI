export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RobHbDEMsXB9pF0WUK8SzZb',
    name: 'Scholar',
    description: 'Scholar',
    mode: 'subscription',
  },
  {
    priceId: 'price_1RoubeDEMsXB9pF0W6wzgCFX',
    name: 'Professional',
    description: 'Monthly',
    mode: 'subscription',
  },
  {
    priceId: 'price_1RoudgDEMsXB9pF0WqO4Dt4L',
    name: 'Enterprise',
    description: 'Monthly',
    mode: 'subscription',
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductByName(name: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.name.toLowerCase() === name.toLowerCase());
}