
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Navigation, Hospital, Fuel } from "lucide-react";
import { toast } from "sonner";

const EmergencyFeature = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [nearestHospital, setNearestHospital] = useState<string | null>(null);
  const [nearestFuelStation, setNearestFuelStation] = useState<string | null>(null);
  
  const activateEmergency = () => {
    // In a real app, this would use geolocation and mapping services to find nearest emergency services
    setIsEmergencyActive(true);
    toast.warning("Emergency mode activated!", {
      description: "Locating nearest emergency services...",
      duration: 5000,
    });
    
    // Simulate finding nearest services
    setTimeout(() => {
      setNearestHospital("City General Hospital - 1.2 km away");
      setNearestFuelStation("Shell Petrol Station - 0.8 km away");
      
      toast.success("Emergency services located!", {
        description: "Navigate to the nearest services using the directions below",
        duration: 5000,
      });
    }, 2000);
  };
  
  const deactivateEmergency = () => {
    setIsEmergencyActive(false);
    setNearestHospital(null);
    setNearestFuelStation(null);
    
    toast.info("Emergency mode deactivated", {
      duration: 3000,
    });
  };
  
  return (
    <Card className={`dashboard-card ${isEmergencyActive ? 'border-red-500' : ''}`}>
      <CardHeader className={`pb-2 ${isEmergencyActive ? 'bg-red-500/10' : ''}`}>
        <CardTitle className="text-lg font-semibold flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Emergency Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEmergencyActive ? (
          <div className="text-center py-2">
            <p className="text-muted-foreground mb-3">
              Activate emergency mode to locate the nearest hospital and fuel station
            </p>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={activateEmergency}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Activate Emergency Mode
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md flex items-start space-x-3">
              <Hospital className="text-red-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-medium">Nearest Hospital</h4>
                <p className="text-sm">{nearestHospital}</p>
                <Button size="sm" variant="outline" className="mt-1">
                  <Navigation className="mr-1 h-3 w-3" />
                  Navigate
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-md flex items-start space-x-3">
              <Fuel className="text-blue-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-medium">Nearest Fuel Station</h4>
                <p className="text-sm">{nearestFuelStation}</p>
                <Button size="sm" variant="outline" className="mt-1">
                  <Navigation className="mr-1 h-3 w-3" />
                  Navigate
                </Button>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-red-500 text-red-500 hover:bg-red-500/10" 
              onClick={deactivateEmergency}
            >
              Deactivate Emergency Mode
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyFeature;
