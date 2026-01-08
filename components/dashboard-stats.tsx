import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="border-border/50 bg-card hover:bg-accent/5 transition-all duration-300 hover-lift hover-glow group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
          <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
             <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
