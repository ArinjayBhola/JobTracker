import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="border-border/50 bg-card hover:bg-accent/5 transition-all duration-300 hover-glow group relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <CardContent className="p-6 relative z-10">
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
    </motion.div>
  );
}
