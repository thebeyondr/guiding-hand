import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "missing" | "pending_verification" | "resolved";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<
  Status,
  {
    label: string;
    icon: typeof AlertCircle;
    className: string;
  }
> = {
  missing: {
    label: "Missing",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  pending_verification: {
    label: "Pending",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-border",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    className: "bg-primary/10 text-primary border-primary/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}
