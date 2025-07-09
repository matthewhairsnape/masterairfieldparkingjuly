import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Smartphone, Plane } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
            <Plane className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Shobdon ParkPay</h1>
          <p className="text-xl text-white/90 mb-8">
            Quick, secure parking payment system
          </p>
          <p className="text-lg text-white/75 max-w-2xl mx-auto">
            Scan QR codes to pay for parking instantly. No apps to download, no accounts needed. 
            Simple, secure payments powered by Stripe.
          </p>
        </div>

        {/* Quick Access Cards - Customer Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-2xl mx-auto">
          <Link href="/payment">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <QrCode className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Pay for Parking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Scan QR code or start your parking payment
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mobile-lookup">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <Smartphone className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-xl">Check Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Verify your parking registration status
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>



        {/* Features Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Scan QR Code</h3>
              <p className="text-white/80">
                Use your phone camera to scan the QR code at your parking location
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Choose Duration</h3>
              <p className="text-white/80">
                Select how long you need to park and enter your license plate
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pay Securely</h3>
              <p className="text-white/80">
                Complete payment with your credit card using secure Stripe processing
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}