import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffExemption } from "@shared/schema";
import { formatLicensePlate } from "@/lib/stripe";

export function StaffExemptions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExemption, setEditingExemption] = useState<StaffExemption | null>(null);

  const { data: exemptions, isLoading } = useQuery<StaffExemption[]>({
    queryKey: ['/api/staff-exemptions'],
  });

  const createExemptionMutation = useMutation({
    mutationFn: async (exemption: {
      licensePlate: string;
      staffName: string;
      startDate: string;
      endDate: string;
    }) => {
      const response = await apiRequest('POST', '/api/staff-exemptions', {
        ...exemption,
        startDate: new Date(exemption.startDate),
        endDate: new Date(exemption.endDate),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-exemptions'] });
      toast({
        title: "Success",
        description: "Staff exemption created successfully",
      });
      setIsModalOpen(false);
      setEditingExemption(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create staff exemption",
        variant: "destructive",
      });
    },
  });

  const updateExemptionMutation = useMutation({
    mutationFn: async ({ id, ...exemption }: {
      id: number;
      licensePlate: string;
      staffName: string;
      startDate: string;
      endDate: string;
    }) => {
      const response = await apiRequest('PATCH', `/api/staff-exemptions/${id}`, {
        ...exemption,
        startDate: new Date(exemption.startDate),
        endDate: new Date(exemption.endDate),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-exemptions'] });
      toast({
        title: "Success",
        description: "Staff exemption updated successfully",
      });
      setIsModalOpen(false);
      setEditingExemption(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update staff exemption",
        variant: "destructive",
      });
    },
  });

  const deleteExemptionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/staff-exemptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-exemptions'] });
      toast({
        title: "Success",
        description: "Staff exemption deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete staff exemption",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const exemptionData = {
      licensePlate: formatLicensePlate(formData.get('licensePlate') as string),
      staffName: formData.get('staffName') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
    };

    if (editingExemption) {
      updateExemptionMutation.mutate({ id: editingExemption.id, ...exemptionData });
    } else {
      createExemptionMutation.mutate(exemptionData);
    }
  };

  const getStatusBadge = (exemption: StaffExemption) => {
    const now = new Date();
    const endDate = new Date(exemption.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary">Expires Soon</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading staff exemptions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Staff Exemptions</h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Exemption
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExemption ? 'Edit Staff Exemption' : 'Add Staff Exemption'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  placeholder="STAFF01"
                  defaultValue={editingExemption?.licensePlate || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="staffName">Staff Name</Label>
                <Input
                  id="staffName"
                  name="staffName"
                  placeholder="John Smith"
                  defaultValue={editingExemption?.staffName || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={editingExemption ? new Date(editingExemption.startDate).toISOString().split('T')[0] : ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={editingExemption ? new Date(editingExemption.endDate).toISOString().split('T')[0] : ''}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createExemptionMutation.isPending || updateExemptionMutation.isPending}>
                  {editingExemption ? 'Update' : 'Create'} Exemption
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Exemptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Staff Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exemptions?.map((exemption) => (
                <TableRow key={exemption.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {exemption.licensePlate}
                    </Badge>
                  </TableCell>
                  <TableCell>{exemption.staffName}</TableCell>
                  <TableCell>{new Date(exemption.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(exemption.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(exemption)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingExemption(exemption);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteExemptionMutation.mutate(exemption.id)}
                        disabled={deleteExemptionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
