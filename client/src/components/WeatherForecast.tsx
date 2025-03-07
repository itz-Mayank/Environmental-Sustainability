import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function WeatherForecast() {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ["/api/environmental/weather"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>7-Day Weather Forecast</CardTitle>
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
        <CardTitle>7-Day Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {forecast?.daily?.map((day: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
              <span>{new Date(day.date).toLocaleDateString()}</span>
              <div className="flex items-center gap-2">
                <span>{day.temp}°C</span>
                <span>{day.condition}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
