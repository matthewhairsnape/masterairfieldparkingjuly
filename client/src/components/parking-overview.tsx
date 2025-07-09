import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RefreshCw, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ParkingRegistration } from "@shared/schema";
import { formatCurrency } from "@/lib/stripe";

export function ParkingOverview() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: registrations, isLoading, refetch } = useQuery<ParkingRegistration[]>({
    queryKey: ['/api/parking-registrations', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`/api/parking-registrations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch registrations');
      return response.json();
    },
  });

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`/api/export-registrations?${params}`);
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parking-registrations.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "CSV export downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (registration: ParkingRegistration) => {
    const now = new Date();
    const endTime = new Date(registration.endTime);
    
    if (registration.status === 'paid' && endTime > now) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    } else if (registration.status === 'paid' && endTime <= now) {
      return <Badge variant="secondary">Expired</Badge>;
    } else if (registration.status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading parking registrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Parking Overview</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parking Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations?.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {registration.licensePlate}
                    </Badge>
                  </TableCell>
                  <TableCell>{registration.durationType.replace('_', ' ')}</TableCell>
                  <TableCell>{formatCurrency(registration.amount)}</TableCell>
                  <TableCell className="capitalize">{registration.paymentMethod}</TableCell>
                  <TableCell>{new Date(registration.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(registration)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
