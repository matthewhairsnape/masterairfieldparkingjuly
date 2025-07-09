import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, Car, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function Confirmation() {
  const [, navigate] = useLocation();

  // In a real app, you would get this data from the URL params or state
  const confirmationData = {
    licensePlate: "ABC123",
    duration: "Half Day (4 hours)",
    amount: "$12.00",
    validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleString(),
    transactionId: "pi_1234567890",
    email: "user@example.com"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-xl text-white/90">Your parking is confirmed</p>
          </div>

          {/* Confirmation Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-green-600">
                Parking Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">License Plate</p>
                      <div className="font-mono text-lg font-bold bg-gray-800 text-white px-3 py-1 rounded inline-block">
                        {confirmationData.licensePlate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{confirmationData.duration}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valid Until</p>
                    <p className="font-semibold text-green-600">{confirmationData.validUntil}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="text-2xl font-bold text-primary">{confirmationData.amount}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm">{confirmationData.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-semibold">Stripe</p>
                  </div>
                </div>
              </div>

              {confirmationData.email && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Receipt sent to</p>
                    <p className="font-semibold">{confirmationData.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Information */}
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Keep this confirmation for your records. Your parking is now active and valid until the time shown above.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/payment')} 
              className="w-full bg-white text-green-600 hover:bg-gray-50"
              size="lg"
            >
              Park Another Vehicle
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/mobile-lookup')}
              className="w-full border-white text-white hover:bg-white hover:text-green-600"
              size="lg"
            >
              Check Parking Status
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/75">
              Thank you for using ParkPay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
