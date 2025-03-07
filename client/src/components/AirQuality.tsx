import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AirQuality() {
  const { data: aqi, isLoading } = useQuery({
    queryKey: ["/api/environmental/aqi"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Air Quality Index</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const getAQIColor = (value: number) => {
    if (value <= 50) return "text-green-500";
    if (value <= 100) return "text-yellow-500";
    if (value <= 150) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Air Quality Index</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <span className={`text-6xl font-bold ${getAQIColor(aqi?.value || 0)}`}>
            {aqi?.value || 'N/A'}
          </span>
          <p className="text-sm text-muted-foreground mt-2">Current AQI</p>
        </div>
        
        <div className="grid gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">PM2.5</p>
            <span className="text-xl">{aqi?.pm25 || 'N/A'} µg/m³</span>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">PM10</p>
            <span className="text-xl">{aqi?.pm10 || 'N/A'} µg/m³</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
