// components/dashboard/KPIStat.tsx
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export type KPIStatProps = {
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  icono?: LucideIcon;
  iconClassName?: string;
};

export function KPIStat({
  title, value, sub, children, icono: Icon, iconClassName = "w-4 h-4",
}: KPIStatProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className={iconClassName} aria-hidden />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        {children}
      </CardContent>
    </Card>
  );
}
