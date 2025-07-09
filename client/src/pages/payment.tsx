import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DurationSelector } from "@/components/duration-selector";
import { stripePromise, formatCurrency, formatLicensePlate } from "@/lib/stripe";
import { ParkingRate } from "@shared/schema";
import { useLocation } from "wouter";

interface PaymentFormData {
  licensePlate: string;
  email: string;
  durationType: string;
  amount: string;
  registrationId?: number;
}

function CheckoutForm({ paymentData }: { paymentData: PaymentFormData }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmPaymentMutation = useMutation({
    mutationFn: async (data: { registrationId: number; paymentIntentId: string }) => {
      const response = await apiRequest('POST', '/api/confirm-payment', data);
      return response.json();
    },
    onSuccess: () => {
      navigate('/confirmation');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      if (paymentData.registrationId) {
        confirmPaymentMutation.mutate({
          registrationId: paymentData.registrationId,
          paymentIntentId: paymentIntent.id,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing || confirmPaymentMutation.isPending}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Processing...' : `Pay ${formatCurrency(paymentData.amount)}`}
      </Button>
    </form>
  );
}

export default function Payment() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [licensePlate, setLicensePlate] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);

  const { data: rates, isLoading } = useQuery<ParkingRate[]>({
    queryKey: ['/api/parking-rates'],
  });

  // Fallback rates if Airtable is not set up yet
  const fallbackRates = [
    { id: 1, durationType: "1_hour", price: "2.50", durationHours: 1, description: "1 Hour" },
    { id: 2, durationType: "2_hours", price: "4.00", durationHours: 2, description: "2 Hours" },
    { id: 3, durationType: "4_hours", price: "8.00", durationHours: 4, description: "4 Hours" },
    { id: 4, durationType: "8_hours", price: "15.00", durationHours: 8, description: "8 Hours" },
    { id: 5, durationType: "12_hours", price: "20.00", durationHours: 12, description: "12 Hours" },
    { id: 6, durationType: "24_hours", price: "32.00", durationHours: 24, description: "24 Hours" },
  ];

  const availableRates = rates && rates.length > 0 ? rates : fallbackRates;

  const createRegistrationMutation = useMutation({
    mutationFn: async (data: {
      licensePlate: string;
      email?: string;
      durationType: string;
      amount: string;
      startTime: Date;
      endTime: Date;
      status: string;
    }) => {
      const response = await apiRequest('POST', '/api/parking-registration', data);
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentData(prev => prev ? { ...prev, registrationId: data.id } : null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create parking registration",
        variant: "destructive",
      });
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: { amount: string; registrationId: number }) => {
      const response = await apiRequest('POST', '/api/create-payment-intent', data);
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setStep(5);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payment intent",
        variant: "destructive",
      });
    },
  });

  const handleNextStep = () => {
    if (step === 1) {
      if (!licensePlate.trim()) {
        toast({
          title: "Error",
          description: "Please enter a license plate number",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedDuration) {
        toast({
          title: "Error",
          description: "Please select a parking duration",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      processPayment();
    }
  };

  const processPayment = async () => {
    if (!selectedDuration || !availableRates) return;

    const selectedRate = availableRates.find(r => r.durationType === selectedDuration);
    if (!selectedRate) return;

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (selectedRate.durationHours * 60 * 60 * 1000));

    const registrationData = {
      licensePlate: formatLicensePlate(licensePlate),
      email: email || undefined,
      durationType: selectedDuration,
      amount: selectedRate.price,
      startTime,
      endTime,
      status: 'pending',
    };

    setPaymentData({
      licensePlate: formatLicensePlate(licensePlate),
      email,
      durationType: selectedDuration,
      amount: selectedRate.price,
    });

    // Create registration first
    createRegistrationMutation.mutate(registrationData);
  };

  useEffect(() => {
    if (paymentData?.registrationId) {
      createPaymentIntentMutation.mutate({
        amount: paymentData.amount,
        registrationId: paymentData.registrationId,
      });
    }
  }, [paymentData?.registrationId]);

  const selectedRate = rates?.find(r => r.durationType === selectedDuration);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">ParkPay</h1>
            <p className="text-xl text-white/90">Quick, secure parking payment</p>
          </div>

          {/* Step 1: License Plate Input */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">1</Badge>
                  Enter License Plate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="licensePlate">License Plate Number</Label>
                  <Input
                    id="licensePlate"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="text-lg uppercase"
                  />
                </div>
                {licensePlate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-mono text-xl font-bold bg-gray-800 text-white px-4 py-2 rounded inline-block">
                      {formatLicensePlate(licensePlate)}
                    </div>
                  </div>
                )}
                <Button onClick={handleNextStep} className="w-full" size="lg">
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Duration Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Select Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DurationSelector
                  options={availableRates.map(rate => ({
                    id: rate.durationType,
                    name: rate.description,
                    description: `${rate.durationHours} hours of parking`,
                    price: rate.price,
                    hours: rate.durationHours,
                    icon: null
                  }))}
                  selectedDuration={selectedDuration}
                  onDurationSelect={setSelectedDuration}
                />

                {selectedDuration && (() => {
                  const selectedRate = availableRates.find(r => r.durationType === selectedDuration);
                  return selectedRate && (
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Selected Option:</h4>
                      <div className="flex justify-between items-center">
                        <span>{selectedRate.description}</span>
                        <span className="font-bold text-lg">{formatCurrency(selectedRate.price)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1" disabled={!selectedDuration}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Email Collection */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">3</Badge>
                  Receipt (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll send your receipt and parking confirmation here
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment Summary */}
          {step === 4 && selectedRate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">4</Badge>
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Parking Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">License Plate</p>
                      <div className="font-mono text-lg font-bold bg-gray-800 text-white px-2 py-1 rounded inline-block">
                        {formatLicensePlate(licensePlate)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{selectedRate.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-semibold">
                        {new Date(Date.now() + selectedRate.durationHours * 60 * 60 * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(selectedRate.price)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1" size="lg">
                    Proceed to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Stripe Payment */}
          {step === 5 && clientSecret && paymentData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">5</Badge>
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm paymentData={paymentData} />
                </Elements>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    🔒 Secure payment powered by Stripe
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}