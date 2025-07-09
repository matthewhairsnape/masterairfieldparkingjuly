import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, CheckCircle, XCircle, AlertCircle, Smartphone, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { formatLicensePlate } from "@/lib/stripe";
import { Link } from "wouter";

interface SearchResult {
  isLegal: boolean;
  status: string;
  type: 'paid' | 'staff' | 'expired' | 'not_found';
  validUntil?: string;
  amount?: string;
  paymentMethod?: string;
}

export default function MobileLookup() {
  const { toast } = useToast();
  const [licensePlate, setLicensePlate] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (licensePlate: string) => {
      const response = await apiRequest('POST', '/api/search-registration', { licensePlate });
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResult(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to search registration",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!licensePlate.trim()) {
      toast({
        title: "Error",
        description: "Please enter a license plate number",
        variant: "destructive",
      });
      return;
    }
    
    searchMutation.mutate(formatLicensePlate(licensePlate));
  };

  const getStatusDisplay = (result: SearchResult) => {
    if (result.isLegal) {
      return {
        icon: <CheckCircle className="h-12 w-12 text-green-500" />,
        title: "Legally Parked",
        description: "This vehicle has valid parking",
        alertClass: "border-green-200 bg-green-50 text-green-800",
        badgeClass: "bg-green-100 text-green-800",
      };
    } else if (result.type === 'expired') {
      return {
        icon: <AlertCircle className="h-12 w-12 text-yellow-500" />,
        title: "Parking Expired",
        description: "This vehicle's parking has expired",
        alertClass: "border-yellow-200 bg-yellow-50 text-yellow-800",
        badgeClass: "bg-yellow-100 text-yellow-800",
      };
    } else {
      return {
        icon: <XCircle className="h-12 w-12 text-red-500" />,
        title: "Not Found",
        description: "No valid parking found for this vehicle",
        alertClass: "border-red-200 bg-red-50 text-red-800",
        badgeClass: "bg-red-100 text-red-800",
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <div className="mb-4">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 p-2"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Mobile Lookup</h1>
            <p className="text-white/90">Quick parking status verification</p>
          </div>

          {/* Search Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">Check Parking Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="text-lg uppercase text-center"
                />
              </div>
              
              <Button 
                onClick={handleSearch} 
                disabled={searchMutation.isPending}
                className="w-full"
                size="lg"
              >
                <Search className="h-5 w-5 mr-2" />
                {searchMutation.isPending ? 'Searching...' : 'Check Status'}
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResult && (
            <Card>
              <CardContent className="pt-6">
                {(() => {
                  const statusDisplay = getStatusDisplay(searchResult);
                  return (
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        {statusDisplay.icon}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-2">{statusDisplay.title}</h3>
                        <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                          {formatLicensePlate(licensePlate)}
                        </Badge>
                      </div>

                      {searchResult.type !== 'not_found' && (
                        <div className="space-y-2 text-sm">
                          {searchResult.validUntil && (
                            <div>
                              <strong>Valid Until:</strong>
                              <br />
                              {new Date(searchResult.validUntil).toLocaleString()}
                            </div>
                          )}
                          {searchResult.amount && (
                            <div>
                              <strong>Amount:</strong> {searchResult.amount}
                            </div>
                          )}
                          {searchResult.paymentMethod && (
                            <div>
                              <strong>Payment Method:</strong> {searchResult.paymentMethod}
                            </div>
                          )}
                        </div>
                      )}

                      <Alert className={statusDisplay.alertClass}>
                        <AlertDescription>
                          {statusDisplay.description}
                        </AlertDescription>
                      </Alert>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mt-6 text-center">
            <p className="text-white/75 text-sm">
              For enforcement use only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
