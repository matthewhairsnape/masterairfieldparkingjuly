import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, DollarSign, Users, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Type definitions for API responses
interface ParkingRate {
  id: number;
  durationType: string;
  price: string;
  durationHours: number;
  description: string;
  updatedAt: Date;
}

interface ParkingRegistration {
  id: number;
  licensePlate: string;
  email: string | null;
  durationType: string;
  amount: string;
  paymentIntentId: string | null;
  paymentMethod: string;
  status: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  receiptSent: boolean;
}

interface StaffExemption {
  id: number;
  licensePlate: string;
  staffName: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

export function AdminOverview() {
  const { data: rates = [] } = useQuery<ParkingRate[]>({
    queryKey: ['/api/parking-rates'],
  });

  const { data: registrations = [] } = useQuery<ParkingRegistration[]>({
    queryKey: ['/api/registrations'],
  });

  const { data: staffExemptions = [] } = useQuery<StaffExemption[]>({
    queryKey: ['/api/staff-exemptions'],
  });

  // Calculate stats
  const totalRevenue = registrations
    .filter((reg: ParkingRegistration) => reg.status === 'paid')
    .reduce((sum: number, reg: ParkingRegistration) => sum + parseFloat(reg.amount || '0'), 0);

  const activeParking = registrations.filter((reg: ParkingRegistration) => {
    if (reg.status !== 'paid') return false;
    const endTime = new Date(reg.endTime);
    return endTime > new Date();
  }).length;

  const todayRegistrations = registrations.filter((reg: ParkingRegistration) => {
    const today = new Date();
    const regDate = new Date(reg.startTime);
    return regDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Admin Overview</h3>
        <p className="text-muted-foreground">
          Monitor your parking system performance and manage operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Parking</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeParking}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Registrations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayRegistrations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Exemptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffExemptions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Current Parking Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rates.map((rate: ParkingRate) => (
              <div key={rate.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{rate.durationType}</Badge>
                  <span className="text-lg font-semibold">${rate.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{rate.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium mb-2">Generate QR Code</h4>
              <p className="text-sm text-muted-foreground">Create QR codes for parking locations</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium mb-2">Add Staff Exemption</h4>
              <p className="text-sm text-muted-foreground">Grant parking privileges to staff</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium mb-2">Export Data</h4>
              <p className="text-sm text-muted-foreground">Download registration reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}