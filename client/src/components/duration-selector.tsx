import { Card, CardContent } from "@/components/ui/card";
import { Clock, Sun, Calendar, CalendarDays } from "lucide-react";
import { formatCurrency } from "@/lib/stripe";
import { cn } from "@/lib/utils";

interface DurationOption {
  id: string;
  name: string;
  description: string;
  price: string;
  hours: number;
  icon: React.ReactNode;
}

interface DurationSelectorProps {
  options: DurationOption[];
  selectedDuration: string | null;
  onDurationSelect: (duration: string) => void;
}

export function DurationSelector({ options, selectedDuration, onDurationSelect }: DurationSelectorProps) {
  const getIcon = (durationType: string) => {
    switch (durationType) {
      case '1_hour':
        return <Clock className="h-8 w-8 text-green-500 mb-3" />;
      case '2_hours':
        return <Clock className="h-8 w-8 text-blue-500 mb-3" />;
      case '4_hours':
        return <Clock className="h-8 w-8 text-yellow-500 mb-3" />;
      case '8_hours':
        return <Sun className="h-8 w-8 text-orange-500 mb-3" />;
      case '12_hours':
        return <Calendar className="h-8 w-8 text-purple-500 mb-3" />;
      case '24_hours':
        return <CalendarDays className="h-8 w-8 text-red-500 mb-3" />;
      default:
        return <Clock className="h-8 w-8 text-primary mb-3" />;
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-center mb-4">
        Choose how long you want to park:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2",
              selectedDuration === option.id
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-gray-200 hover:border-primary/50"
            )}
            onClick={() => onDurationSelect(option.id)}
          >
            <CardContent className="p-6 text-center">
              {getIcon(option.id)}
              <h3 className="text-lg font-semibold mb-2">{option.name}</h3>
              <p className="text-muted-foreground mb-3 text-sm">{option.description}</p>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(option.price)}
              </div>
              {selectedDuration === option.id && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                    Selected
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
