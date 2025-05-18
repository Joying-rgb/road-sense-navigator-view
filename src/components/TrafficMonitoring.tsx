
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarFront } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Vehicle {
  id: number;
  type: "car" | "truck" | "motorcycle" | "bus" | "bicycle";
  distance: number; // in meters
  speed: number; // in km/h
  trajectory: "approaching" | "departing" | "parallel";
  collisionRisk: number; // 0-1
}

interface TrafficMonitoringProps {
  isEnabled: boolean;
  videoElement?: HTMLVideoElement | null;
  onHighRiskVehicleDetected?: (vehicle: Vehicle) => void;
}

const TrafficMonitoring = ({ 
  isEnabled,
  videoElement,
  onHighRiskVehicleDetected
}: TrafficMonitoringProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Simulate 3D traffic monitoring (would be replaced with actual 3D monitoring system)
  useEffect(() => {
    if (!isEnabled || !videoElement) {
      setIsMonitoring(false);
      return;
    }
    
    setIsMonitoring(true);
    
    // Generate mock data for vehicle tracking
    const monitorInterval = setInterval(() => {
      // Simulate detecting 1-3 vehicles
      const vehicleCount = Math.floor(Math.random() * 3) + 1;
      const newVehicles: Vehicle[] = [];
      
      for (let i = 0; i < vehicleCount; i++) {
        const vehicleTypes: ("car" | "truck" | "motorcycle" | "bus" | "bicycle")[] = [
          "car", "truck", "motorcycle", "bus", "bicycle"
        ];
        const trajectories: ("approaching" | "departing" | "parallel")[] = [
          "approaching", "departing", "parallel"
        ];
        
        const vehicle: Vehicle = {
          id: Math.floor(Math.random() * 1000) + 1,
          type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
          distance: Math.random() * 50, // 0-50 meters
          speed: Math.random() * 80 + 20, // 20-100 km/h
          trajectory: trajectories[Math.floor(Math.random() * trajectories.length)],
          collisionRisk: Math.random()
        };
        
        // If high risk detected, trigger callback
        if (vehicle.collisionRisk > 0.7) {
          onHighRiskVehicleDetected?.(vehicle);
        }
        
        newVehicles.push(vehicle);
      }
      
      setVehicles(newVehicles);
    }, 5000);
    
    return () => {
      clearInterval(monitorInterval);
      setIsMonitoring(false);
    };
  }, [isEnabled, videoElement, onHighRiskVehicleDetected]);

  if (!isEnabled) {
    return null;
  }

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">3D Traffic Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Monitoring Status:</span>
            <span className="flex items-center">
              <span className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-yellow-500'} mr-1.5`}></span>
              {isMonitoring ? 'Active' : 'Standby'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {vehicles.length} vehicles currently tracked
          </div>
        </div>
        
        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <div className="text-center py-3 text-sm text-muted-foreground">
              No vehicles currently detected
            </div>
          ) : (
            vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-accent/20 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <CarFront size={16} className="mr-1" />
                    <span className="text-sm font-medium capitalize">{vehicle.type}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    vehicle.trajectory === "approaching" ? "bg-yellow-500/20 text-yellow-500" : 
                    vehicle.trajectory === "departing" ? "bg-green-500/20 text-green-500" : 
                    "bg-blue-500/20 text-blue-500"
                  }`}>
                    {vehicle.trajectory}
                  </span>
                </div>
                <div className="text-xs flex justify-between mb-1">
                  <span>Distance: {vehicle.distance.toFixed(1)}m</span>
                  <span>Speed: {vehicle.speed.toFixed(1)} km/h</span>
                </div>
                <div className="text-xs mb-1">Collision Risk:</div>
                <Progress 
                  value={vehicle.collisionRisk * 100} 
                  className={`h-1 ${
                    vehicle.collisionRisk > 0.7 ? "bg-red-500" : 
                    vehicle.collisionRisk > 0.4 ? "bg-yellow-500" : 
                    "bg-green-500"
                  }`} 
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficMonitoring;
