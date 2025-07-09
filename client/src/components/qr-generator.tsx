import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface QRData {
  qrCode: string;
  paymentUrl: string;
  location: string;
}

export function QRGenerator() {
  const { toast } = useToast();
  const [location, setLocation] = useState("Main Parking Area");
  const [qrData, setQrData] = useState<QRData | null>(null);

  const generateQRMutation = useMutation({
    mutationFn: async (location: string) => {
      const response = await fetch(`/api/generate-qr?location=${encodeURIComponent(location)}`);
      if (!response.ok) throw new Error('Failed to generate QR code');
      return response.json();
    },
    onSuccess: (data) => {
      setQrData(data);
      toast({
        title: "Success",
        description: "QR code generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!location.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location name",
        variant: "destructive",
      });
      return;
    }
    generateQRMutation.mutate(location);
  };

  const handleDownload = () => {
    if (!qrData) return;
    
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `parking-qr-${qrData.location.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">QR Code Generator</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Generate Parking QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Parking Location Name</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Parking Area, Building A, Visitor Parking"
            />
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={generateQRMutation.isPending}
            className="w-full"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {generateQRMutation.isPending ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {qrData && (
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                {qrData.location}
              </Badge>
              <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                <img 
                  src={qrData.qrCode} 
                  alt={`QR Code for ${qrData.location}`}
                  className="w-64 h-64"
                />
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Payment URL:</p>
              <p className="font-mono text-sm break-all">{qrData.paymentUrl}</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button onClick={handleGenerate} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Print this QR code and place it at the parking location</li>
                <li>Visitors scan the code to access the payment form</li>
                <li>The code links directly to your parking payment system</li>
                <li>Each location can have its own QR code for tracking</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}