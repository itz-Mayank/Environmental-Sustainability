import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: environmentalData, isLoading } = useQuery({
    queryKey: ["/api/environmental/aqi"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Overview</CardTitle>
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
        <CardTitle>Dashboard Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">Current AQI</p>
              <h3 className="text-2xl font-bold">{environmentalData?.aqi || 'N/A'}</h3>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">Water Quality</p>
              <h3 className="text-2xl font-bold">{environmentalData?.waterQuality || 'N/A'}</h3>
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">Weather Alert Status</p>
            <h3 className="text-2xl font-bold">{environmentalData?.weatherStatus || 'Normal'}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
