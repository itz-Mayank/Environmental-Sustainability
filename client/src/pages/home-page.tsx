import { useAuth } from "@/hooks/use-auth";
import Dashboard from "@/components/Dashboard";
import Map from "@/components/Map";
import WeatherForecast from "@/components/WeatherForecast";
import AirQuality from "@/components/AirQuality";
import WaterQuality from "@/components/WaterQuality";
import AlertSystem from "@/components/AlertSystem";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Environmental Monitor</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Dashboard />
          <Map />
          <WeatherForecast />
          <AirQuality />
          <WaterQuality />
          <AlertSystem />
        </div>
      </main>
    </div>
  );
}
