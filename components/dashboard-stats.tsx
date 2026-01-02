import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  colorClass: string;
}

export function StatsCard({ title, value, icon: Icon, description, colorClass }: StatsCardProps) {
  return (
    <Card className="border-border/50 bg-card hover:border-border transition-colors duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn(
            "p-2 rounded-lg shadow-sm flex items-center justify-center",
            colorClass
          )}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">{value}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
