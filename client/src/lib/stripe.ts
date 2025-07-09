import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get Stripe public key from environment variables
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// For development, create mock Stripe if credentials are not provided
if (!stripePublicKey && import.meta.env.DEV) {
  console.warn('⚠️  Running in development mode with mock Stripe. Set VITE_STRIPE_PUBLIC_KEY for payment functionality.');
}

export const stripePromise = stripePublicKey 
  ? loadStripe(stripePublicKey)
  : Promise.resolve(null);

export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(numAmount);
};

export const formatLicensePlate = (plate: string): string => {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
};
