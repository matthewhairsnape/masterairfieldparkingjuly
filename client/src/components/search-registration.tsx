import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { formatLicensePlate } from "@/lib/stripe";

interface SearchResult {
  isLegal: boolean;
  status: string;
  type: 'paid' | 'staff' | 'expired' | 'not_found';
  validUntil?: string;
  amount?: string;
  paymentMethod?: string;
}

export function SearchRegistration() {
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

  const getStatusIcon = (result: SearchResult) => {
    if (result.isLegal) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    } else if (result.type === 'expired') {
      return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusColor = (result: SearchResult) => {
    if (result.isLegal) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (result.type === 'expired') {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else {
      return "bg-red-100 text-red-800 border-red-200";
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Search Registration</h3>

      <Card>
        <CardHeader>
          <CardTitle>License Plate Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="licensePlate">License Plate Number</Label>
              <Input
                id="licensePlate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="uppercase"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={searchMutation.isPending}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getStatusIcon(searchResult)}
                <div>
                  <div className="flex items-center gap-2">
                    <strong>License Plate:</strong>
                    <Badge variant="outline" className="font-mono">
                      {formatLicensePlate(licensePlate)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <strong>Status:</strong>
                    <Badge className={getStatusColor(searchResult)}>
                      {searchResult.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {searchResult.type !== 'not_found' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Valid Until:</strong>
                    <p>{searchResult.validUntil ? new Date(searchResult.validUntil).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <strong>Amount Paid:</strong>
                    <p>{searchResult.amount || 'N/A'}</p>
                  </div>
                  <div>
                    <strong>Payment Method:</strong>
                    <p>{searchResult.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <strong>Type:</strong>
                    <p className="capitalize">{searchResult.type.replace('_', ' ')}</p>
                  </div>
                </div>
              )}

              <Alert className={searchResult.isLegal ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={searchResult.isLegal ? "text-green-800" : "text-red-800"}>
                  {searchResult.isLegal 
                    ? "This vehicle is legally parked with valid payment or exemption."
                    : "This vehicle does not have valid parking or the parking has expired."
                  }
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
