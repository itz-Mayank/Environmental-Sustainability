import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function WaterQuality() {
  const { data: waterQuality, isLoading } = useQuery({
    queryKey: ["/api/environmental/water"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Quality Metrics</CardTitle>
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
        <CardTitle>Water Quality Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">pH Level</p>
            <span className="text-xl">{waterQuality?.ph || 'N/A'}</span>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">Turbidity</p>
            <span className="text-xl">{waterQuality?.turbidity || 'N/A'} NTU</span>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">Dissolved Oxygen</p>
            <span className="text-xl">{waterQuality?.dissolvedOxygen || 'N/A'} mg/L</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
