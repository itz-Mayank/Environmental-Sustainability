import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { insertAlertSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AlertSystem() {
  const { toast } = useToast();
  const [threshold, setThreshold] = useState("");
  const [alertType, setAlertType] = useState<"aqi" | "water" | "weather">("aqi");

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: { type: string; threshold: number }) => {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create alert");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Created",
        description: "Your alert has been set successfully.",
      });
      setThreshold("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert System</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert System</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Alert threshold"
            />
            <Button
              onClick={() => {
                if (!threshold) return;
                createAlertMutation.mutate({
                  type: alertType,
                  threshold: parseInt(threshold),
                });
              }}
              disabled={createAlertMutation.isPending}
            >
              Set Alert
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={alertType === "aqi" ? "default" : "outline"}
              onClick={() => setAlertType("aqi")}
            >
              AQI
            </Button>
            <Button
              variant={alertType === "water" ? "default" : "outline"}
              onClick={() => setAlertType("water")}
            >
              Water
            </Button>
            <Button
              variant={alertType === "weather" ? "default" : "outline"}
              onClick={() => setAlertType("weather")}
            >
              Weather
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Active Alerts</h3>
            {alerts?.map((alert: any) => (
              <div
                key={alert.id}
                className="p-2 bg-primary/10 rounded-lg flex justify-between items-center"
              >
                <span>
                  {alert.type.toUpperCase()} Alert: {alert.threshold}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
