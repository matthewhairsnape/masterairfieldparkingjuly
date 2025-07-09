import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Clock, Sun, Calendar, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ParkingRate } from "@shared/schema";

export function RateManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: rates, isLoading } = useQuery<ParkingRate[]>({
    queryKey: ['/api/parking-rates'],
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ id, price }: { id: number; price: string }) => {
      const response = await apiRequest('PATCH', `/api/parking-rates/${id}`, { price });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parking-rates'] });
      toast({
        title: "Success",
        description: "Parking rates updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update parking rates",
        variant: "destructive",
      });
    },
  });

  const [rateValues, setRateValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rates) {
      const initialValues: Record<string, string> = {};
      rates.forEach(rate => {
        initialValues[rate.durationType] = rate.price;
      });
      setRateValues(initialValues);
    }
  }, [rates]);

  const handleSaveRates = async () => {
    if (!rates) return;
    
    try {
      for (const rate of rates) {
        const newPrice = rateValues[rate.durationType];
        if (newPrice && newPrice !== rate.price) {
          await updateRateMutation.mutateAsync({ id: rate.id, price: newPrice });
        }
      }
    } catch (error) {
      console.error('Error updating rates:', error);
    }
  };

  const getIcon = (durationType: string) => {
    switch (durationType) {
      case '1_hour':
        return <Clock className="h-6 w-6 text-primary" />;
      case '2_hours':
        return <Clock className="h-6 w-6 text-primary" />;
      case '4_hours':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case '8_hours':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case '12_hours':
        return <Calendar className="h-6 w-6 text-orange-500" />;
      case '24_hours':
        return <CalendarDays className="h-6 w-6 text-green-500" />;
      default:
        return <Clock className="h-6 w-6 text-primary" />;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading rates...</div>;
  }

  if (!rates || rates.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No parking rates found. Default rates will be created automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Rate Management</h3>
        <Button onClick={handleSaveRates} disabled={updateRateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rates?.map((rate) => (
          <Card key={rate.id} className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                {getIcon(rate.durationType)}
                <div>
                  <div className="text-lg font-bold">{rate.description}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    Duration: {rate.durationHours} hour{rate.durationHours > 1 ? 's' : ''}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`duration-${rate.id}`} className="text-sm font-medium">
                  Duration (Hours)
                </Label>
                <Input
                  id={`duration-${rate.id}`}
                  value={`${rate.durationHours} hours`}
                  readOnly
                  className="bg-muted text-center font-mono"
                />
              </div>
              <div>
                <Label htmlFor={`price-${rate.id}`} className="text-sm font-medium">
                  Price (GBP £)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">£</span>
                  <Input
                    id={`price-${rate.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7 text-lg font-semibold"
                    value={rateValues[rate.durationType] || ''}
                    onChange={(e) => setRateValues(prev => ({
                      ...prev,
                      [rate.durationType]: e.target.value
                    }))}
                  />
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  This rate will be shown to customers as: <strong>{rate.description}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
