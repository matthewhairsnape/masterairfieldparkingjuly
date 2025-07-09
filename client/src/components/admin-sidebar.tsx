import { cn } from "@/lib/utils";
import { DollarSign, ShieldQuestion, BarChart, Search, QrCode, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'qr', label: 'QR Generator', icon: QrCode },
  { id: 'rates', label: 'Parking Rates', icon: DollarSign },
  { id: 'staff', label: 'Staff Exemptions', icon: ShieldQuestion },
  { id: 'registrations', label: 'All Registrations', icon: BarChart },
  { id: 'search', label: 'Search Registration', icon: Search },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <div className="w-64 bg-muted/40 border-r border-border h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeTab === item.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      <Separator />
      <div className="p-6 mt-auto">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">System Status</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Airtable Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Stripe Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}