import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type StateProps = {
  message: string;
  onRetry?: () => void;
};

export function LoadingState({ message }: StateProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-200" />
        <span className="font-medium">{message}</span>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ message }: StateProps) {
  return (
    <Card>
      <CardContent className="py-8 text-muted-foreground">{message}</CardContent>
    </Card>
  );
}

export function ErrorState({ message, onRetry }: StateProps) {
  return (
    <Card className="border-red-300/20 bg-red-500/10">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-8">
        <div className="flex items-center gap-3 text-red-100">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">{message}</span>
        </div>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
