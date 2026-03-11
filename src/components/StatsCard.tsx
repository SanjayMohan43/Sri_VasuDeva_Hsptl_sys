import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: { value: number; positive: boolean };
  className?: string;
}

const StatsCard = ({ title, value, icon, description, trend, className }: StatsCardProps) => (
  <Card className={cn("shadow-card border-0 hover:shadow-elevated transition-shadow", className)}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      {trend && (
        <p className={cn("text-sm mt-1 font-medium", trend.positive ? "text-success" : "text-destructive")}>
          {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last week
        </p>
      )}
    </CardContent>
  </Card>
);

export default StatsCard;
