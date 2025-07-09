import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface AdminNavProps {
  onLogout: () => void;
}

export function AdminNav({ onLogout }: AdminNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Airport Parking</h1>
            <p className="text-sm text-gray-500">Admin Console</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Graham Neal</span>
            <span className="mx-2">•</span>
            <span>Administrator</span>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
