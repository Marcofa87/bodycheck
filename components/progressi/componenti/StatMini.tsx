import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";
import { ArrowDownRightIcon, MinusIcon, ArrowUpRightIcon } from "lucide-react";

function StatMini({
  label,
  valore,
  unita,
  trend,
  sottotitolo,
}: {
  label: string;
  valore: string | null;
  unita: string;
  trend?: number;
  sottotitolo?: string;
}) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1">
          {trend !== undefined && valore !== null && (
            <span
              className={cn(
                "self-center",
                trend > 0
                  ? "text-negative"
                  : trend < 0
                    ? "text-positive"
                    : "text-muted-foreground",
              )}
            >
              {trend > 0 ? (
                <ArrowUpRightIcon className="size-4" />
              ) : trend < 0 ? (
                <ArrowDownRightIcon className="size-4" />
              ) : (
                <MinusIcon className="size-4" />
              )}
            </span>
          )}
          <span className="text-xl font-semibold tabular-nums">
            {valore ?? "—"}
          </span>
          {valore !== null && unita && (
            <span className="text-xs text-muted-foreground">{unita}</span>
          )}
        </div>
        {sottotitolo && (
          <p className="truncate text-[11px] text-muted-foreground">
            {sottotitolo}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default StatMini;
