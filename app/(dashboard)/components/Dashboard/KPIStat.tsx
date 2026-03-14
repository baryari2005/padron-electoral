// components/dashboard/KPIStat.tsx
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export type KPIStatProps = {
  title: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  icono?: LucideIcon;
  iconClassName?: string;
  iconoDescription?: LucideIcon;
  description?: string;
};

export function KPIStat({
  title, value, sub, children, icono: Icon, iconClassName = "w-4 h-4", iconoDescription: Icon2, description, subValue
}: KPIStatProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className={iconClassName} aria-hidden />}
          {title}          
        </CardTitle>
        <CardDescription className="flex items-center text-xs text-muted-foreground animate-pulse">
          {Icon2 && <Icon2 className="w-3 h-3 mr-2"/>}{description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-1xl font-bold">{subValue}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        {children}
      </CardContent>
    </Card>
  );
}
