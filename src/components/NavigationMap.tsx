
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Route } from "lucide-react";

const SERP_API_KEY = "c2242a49c3eda3248a47be63d8347d1ad9aa10ea0eef1d2326775c566ac0b6cd";

interface NavigationStep {
  instruction: string;
  distance: string;
  time: string;
}

const NavigationMap = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [co2Saved, setCo2Saved] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const handleRouteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination) {
      toast.error("Please enter both origin and destination");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the SERP API request for directions
      const searchQuery = `${origin} to ${destination} directions`;
      const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${SERP_API_KEY}`;
      
      // In a production app, you'd call this API from a backend to protect your API key
      // For this demo, we'll simulate a successful map load and generate mock navigation steps
      
      toast.success("Route found");
      
      // Generate mock navigation steps (in a real app, this would come from the routing API)
      const mockSteps: NavigationStep[] = [
        { instruction: "Head north on Main St", distance: "0.5 km", time: "2 min" },
        { instruction: "Turn right onto Broadway Ave", distance: "1.2 km", time: "4 min" },
        { instruction: "Take the ramp onto Highway 101", distance: "5.8 km", time: "6 min" },
        { instruction: "Keep left at the fork", distance: "2.3 km", time: "3 min" },
        { instruction: "Take exit 25B for Downtown", distance: "0.8 km", time: "1 min" },
        { instruction: "Turn right onto Market St", distance: "1.5 km", time: "5 min" },
        { instruction: "Your destination is on the right", distance: "0 km", time: "0 min" }
      ];
      
      setNavigationSteps(mockSteps);
      setCurrentStepIndex(0);
      
      // Calculate estimated CO2 savings based on route (mock calculation)
      // In a real app, this would be based on vehicle type, route efficiency, etc.
      const routeDistance = mockSteps.reduce((total, step) => {
        const km = parseFloat(step.distance.replace(" km", "")) || 0;
        return total + km;
      }, 0);
      
      const estimatedCo2Saved = Math.round(routeDistance * 0.12 * 100) / 100; // 0.12kg CO2 saved per km (example)
      setCo2Saved(estimatedCo2Saved);
      
      // Generate embedded Google Maps URL with directions
      const directionsUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&zoom=10`;
      setMapUrl(directionsUrl);
      
      // Simulate navigation progress
      // In a real app, this would be updated based on GPS coordinates
      startNavigationSimulation();
    } catch (error) {
      console.error("Failed to fetch route:", error);
      toast.error("Failed to fetch route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const startNavigationSimulation = () => {
    // Reset index
    setCurrentStepIndex(0);
    
    // Simulate navigation progress by advancing through steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= navigationSteps.length) {
          clearInterval(stepInterval);
          toast.success("You have reached your destination!");
          return prevIndex;
        }
        return nextIndex;
      });
    }, 8000); // Advance to next step every 8 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(stepInterval);
  };
  
  // Log for demonstration (would be removed in production)
  useEffect(() => {
    if (origin && destination) {
      console.log("Routing from", origin, "to", destination);
    }
  }, [origin, destination]);

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRouteSearch} className="mb-4">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Input
                placeholder="Current Location" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-muted"
              />
            </div>
            <div>
              <Input
                placeholder="Destination" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-muted"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding route...
                </span>
              ) : (
                <span className="flex items-center">
                  <Route className="mr-2 h-4 w-4" />
                  Find Route
                </span>
              )}
            </Button>
          </div>
        </form>
        
        {/* Navigation Instructions */}
        {navigationSteps.length > 0 && (
          <div className="mb-3 p-3 bg-accent/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Current Direction:</h3>
              <div className="text-xs bg-accent/30 px-2 py-1 rounded-full">
                Step {currentStepIndex + 1} of {navigationSteps.length}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <Route className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{navigationSteps[currentStepIndex].instruction}</p>
                <div className="flex text-xs text-muted-foreground mt-1 space-x-3">
                  <span>{navigationSteps[currentStepIndex].distance}</span>
                  <span>•</span>
                  <span>{navigationSteps[currentStepIndex].time}</span>
                </div>
              </div>
            </div>
            {co2Saved > 0 && (
              <div className="mt-2 text-xs flex items-center">
                <span className="text-green-500 font-medium">
                  Estimated CO2 saved: {co2Saved} kg
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="h-[250px] bg-muted rounded-lg overflow-hidden">
          {mapUrl ? (
            <iframe
              ref={iframeRef}
              src={mapUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Navigation Map"
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Route size={36} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Enter locations to display route</p>
              <p className="text-xs text-muted-foreground mt-1">Powered by SERP API</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationMap;
