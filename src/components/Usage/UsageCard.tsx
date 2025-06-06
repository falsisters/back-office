import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "@/components/ui/badge";

interface UsageCardProps {
  title: string;
  currentUsage: string;
  totalUsage?: string;
  percentage?: number;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const UsageCard = ({
  title,
  currentUsage,
  totalUsage,
  percentage = 0,
  icon,
  children,
}: UsageCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          {percentage.toFixed(1)}% used
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold text-primary">
              {currentUsage}
            </div>
            {totalUsage && (
              <p className="text-xs text-muted-foreground">of {totalUsage}</p>
            )}
          </div>
          <Progress value={percentage} className="w-full" />
          {children && <div className="pt-4">{children}</div>}
        </div>
      </CardContent>
    </Card>
  );
};
