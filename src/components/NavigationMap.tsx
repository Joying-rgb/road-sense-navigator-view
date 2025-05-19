import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Route, AlertTriangle } from "lucide-react";

interface NavigationState {
  origin: string;
  destination: string;
  previousDestination?: string;
}

interface NavigationMapProps {
  navigationState?: NavigationState;
  setNavigationState?: React.Dispatch<React.SetStateAction<NavigationState>>;
}

export interface NavigationStep {
  instruction: string;
  distance: string;
  time: string;
}

const SERP_API_KEY = "c2242a49c3eda3248a47be63d8347d1ad9aa10ea0eef1d2326775c566ac0b6cd";

const NavigationMap = ({ navigationState, setNavigationState }: NavigationMapProps) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [co2Saved, setCo2Saved] = useState<number>(0);
  const [routeActive, setRouteActive] = useState(false);
  const [isEmergencyRoute, setIsEmergencyRoute] = useState(false);
  const [destinationReached, setDestinationReached] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stepIntervalRef = useRef<number | null>(null);
  
  // Sync internal state with parent state if provided
  useEffect(() => {
    if (navigationState) {
      setOrigin(navigationState.origin || "");
      setDestination(navigationState.destination || "");
      
      // If destination changed externally, handle it
      if (navigationState.destination && navigationState.destination !== destination) {
        // If there's a non-empty destination, calculate the route
        if (navigationState.destination.trim() !== "") {
          handleRouteSearch(undefined, true);
        }
      }
    }
  }, [navigationState]);
  
  // Listen for emergency navigation events
  useEffect(() => {
    const handleEmergencyNavigate = (event: CustomEvent<{ destination: string }>) => {
      if (event.detail.destination) {
        // Set default origin if empty
        if (!origin || origin.trim() === "") {
          const defaultOrigin = "Current Location";
          setOrigin(defaultOrigin);
          
          if (setNavigationState) {
            setNavigationState(prev => ({
              ...prev,
              origin: defaultOrigin
            }));
          }
        }
        
        setDestination(event.detail.destination);
        setIsEmergencyRoute(true);
        handleRouteSearch(undefined, true);
      }
    };
    
    const handleEmergencyClear = () => {
      if (isEmergencyRoute) {
        setMapUrl(null);
        setNavigationSteps([]);
        setCurrentStepIndex(0);
        setCo2Saved(0);
        setRouteActive(false);
        setIsEmergencyRoute(false);
        setDestinationReached(false);
        window.dispatchEvent(new CustomEvent('navigation:route-cancelled'));
      }
    };
    
    window.addEventListener('emergency:navigate', handleEmergencyNavigate as EventListener);
    window.addEventListener('emergency:clear', handleEmergencyClear);
    
    return () => {
      window.removeEventListener('emergency:navigate', handleEmergencyNavigate as EventListener);
      window.removeEventListener('emergency:clear', handleEmergencyClear);
    };
  }, [isEmergencyRoute, origin, setNavigationState]);
  
  const handleRouteSearch = async (e?: React.FormEvent, skipValidation = false) => {
    if (e) e.preventDefault();
    
    // Ensure origin is set
    const currentOrigin = origin || "Current Location";
    
    if (!skipValidation && (!currentOrigin || !destination)) {
      toast.error("Please enter both origin and destination");
      return;
    }
    
    setIsLoading(true);
    setDestinationReached(false);
    
    try {
      // Create the SERP API request for directions
      const searchQuery = `${currentOrigin} to ${destination} directions`;
      const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${SERP_API_KEY}`;
      
      // In a production app, you'd call this API from a backend to protect your API key
      // For this demo, we'll simulate a successful map load and generate navigation steps based on the destination
      
      toast.success(isEmergencyRoute ? 
        "Emergency route found" : 
        "Route found"
      );
      
      // Update parent state if available
      if (setNavigationState) {
        setNavigationState(prev => ({
          ...prev,
          origin: currentOrigin,
          destination
        }));
      }
      
      // Generate navigation steps based on destination
      // In a real app, these would come from the routing API
      let mockSteps: NavigationStep[] = [];
      
      // Customize steps based on destination for more realistic simulation
      if (destination.toLowerCase().includes("hospital") || isEmergencyRoute) {
        mockSteps = [
          { instruction: "Turn right onto Emergency Lane", distance: "0.3 km", time: "1 min" },
          { instruction: "Take the fast lane on Highway 101", distance: "4.2 km", time: "3 min" },
          { instruction: "Take emergency exit toward Hospital", distance: "0.5 km", time: "1 min" },
          { instruction: "Turn left at the Emergency entrance", distance: "0.2 km", time: "1 min" },
          { instruction: "You have arrived at the Emergency Department", distance: "0 km", time: "0 min" }
        ];
      } else if (destination.toLowerCase().includes("airport")) {
        mockSteps = [
          { instruction: "Head east on Main St", distance: "1.2 km", time: "3 min" },
          { instruction: "Take the ramp onto Airport Highway", distance: "5.8 km", time: "6 min" },
          { instruction: "Keep left at the fork toward Terminals", distance: "2.1 km", time: "2 min" },
          { instruction: "Take exit for Departures", distance: "0.7 km", time: "1 min" },
          { instruction: "You have arrived at the Airport Terminal", distance: "0 km", time: "0 min" }
        ];
      } else if (destination.toLowerCase().includes("downtown")) {
        mockSteps = [
          { instruction: "Head north on Main St", distance: "0.5 km", time: "2 min" },
          { instruction: "Turn right onto Broadway Ave", distance: "1.2 km", time: "4 min" },
          { instruction: "Continue onto Downtown Plaza", distance: "0.8 km", time: "3 min" },
          { instruction: "Turn left onto Market St", distance: "0.6 km", time: "2 min" },
          { instruction: "Your destination is on the right", distance: "0 km", time: "0 min" }
        ];
      } else {
        // Default route
        mockSteps = [
          { instruction: "Head north on Main St", distance: "0.5 km", time: "2 min" },
          { instruction: "Turn right onto Broadway Ave", distance: "1.2 km", time: "4 min" },
          { instruction: "Take the ramp onto Highway 101", distance: "5.8 km", time: "6 min" },
          { instruction: "Keep left at the fork", distance: "2.3 km", time: "3 min" },
          { instruction: "Take exit 25B for Downtown", distance: "0.8 km", time: "1 min" },
          { instruction: "Turn right onto Market St", distance: "1.5 km", time: "5 min" },
          { instruction: "Your destination is on the right", distance: "0 km", time: "0 min" }
        ];
      }
      
      setNavigationSteps(mockSteps);
      setCurrentStepIndex(0);
      
      // Calculate estimated CO2 savings based on route
      // In a real app, this would be based on vehicle type, route efficiency, etc.
      const routeDistance = mockSteps.reduce((total, step) => {
        const km = parseFloat(step.distance.replace(" km", "")) || 0;
        return total + km;
      }, 0);
      
      const estimatedCo2Saved = Math.round(routeDistance * 0.12 * 100) / 100; // 0.12kg CO2 saved per km (example)
      setCo2Saved(estimatedCo2Saved);
      
      // Generate embedded Google Maps URL with directions
      // Make sure both parameters are valid
      if (currentOrigin && destination) {
        const directionsUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodeURIComponent(currentOrigin)}&destination=${encodeURIComponent(destination)}&zoom=10`;
        setMapUrl(directionsUrl);
      } else {
        toast.error("Invalid origin or destination");
      }
      
      // Set route as active and dispatch event with navigation steps
      setRouteActive(true);
      window.dispatchEvent(new CustomEvent('navigation:route-calculated', { 
        detail: {
          steps: mockSteps
        }
      }));
      
      // Start navigation simulation
      startNavigationSimulation();
    } catch (error) {
      console.error("Failed to fetch route:", error);
      toast.error("Failed to fetch route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelRoute = () => {
    // Clear the route
    setMapUrl(null);
    setNavigationSteps([]);
    setCurrentStepIndex(0);
    setCo2Saved(0);
    setIsEmergencyRoute(false);
    setDestinationReached(false);
    
    // Set route as inactive and dispatch event
    setRouteActive(false);
    window.dispatchEvent(new CustomEvent('navigation:route-cancelled'));
    
    // Clear the interval if it exists
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    
    // Update parent state if available
    if (setNavigationState) {
      setNavigationState(prev => ({
        ...prev,
        destination: ""
      }));
    }
  };
  
  const startNavigationSimulation = () => {
    // Reset index and destination reached status
    setCurrentStepIndex(0);
    setDestinationReached(false);
    
    // Clear existing interval if any
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
    }
    
    // Simulate navigation progress by advancing through steps
    stepIntervalRef.current = window.setInterval(() => {
      setCurrentStepIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= navigationSteps.length - 1) { // Use length-1 to stop at last step
          if (stepIntervalRef.current) {
            clearInterval(stepIntervalRef.current);
            stepIntervalRef.current = null;
          }
          
          // Only show destination reached message if we're at the final step
          if (nextIndex === navigationSteps.length - 1) {
            setDestinationReached(true);
            toast.success("You have reached your destination!");
          }
          
          return Math.min(nextIndex, navigationSteps.length - 1); // Don't exceed array bounds
        }
        return nextIndex;
      });
    }, 8000); // Advance to next step every 8 seconds
  };
  
  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, []);

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
                onChange={(e) => {
                  setOrigin(e.target.value);
                  if (setNavigationState) {
                    setNavigationState(prev => ({
                      ...prev,
                      origin: e.target.value
                    }));
                  }
                }}
                className="bg-muted"
              />
            </div>
            <div>
              <Input
                placeholder="Destination" 
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  if (setNavigationState) {
                    setNavigationState(prev => ({
                      ...prev,
                      destination: e.target.value
                    }));
                  }
                }}
                className="bg-muted"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1"
              >
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
                    {isEmergencyRoute ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                        Find Emergency Route
                      </>
                    ) : (
                      <>
                        <Route className="mr-2 h-4 w-4" />
                        Find Route
                      </>
                    )}
                  </span>
                )}
              </Button>
              {routeActive && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelRoute}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
        
        {/* Navigation Instructions */}
        {navigationSteps.length > 0 && (
          <div className={`mb-3 p-3 rounded-lg ${isEmergencyRoute ? 'bg-red-500/10' : 'bg-accent/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium flex items-center">
                {isEmergencyRoute && (
                  <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
                )}
                {destinationReached ? "Destination Reached" : "Current Direction:"}
              </h3>
              <div className={`text-xs px-2 py-1 rounded-full ${
                isEmergencyRoute ? 'bg-red-500/30 text-red-500' : 'bg-accent/30'
              }`}>
                Step {currentStepIndex + 1} of {navigationSteps.length}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isEmergencyRoute ? 'bg-red-500/20' : 'bg-primary/20'
              }`}>
                <Route className={`h-5 w-5 ${
                  isEmergencyRoute ? 'text-red-500' : 'text-primary'
                }`} />
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
            {co2Saved > 0 && !isEmergencyRoute && (
              <div className="mt-2 text-xs flex items-center">
                <span className="text-green-500 font-medium">
                  Estimated CO2 saved: {co2Saved} kg
                </span>
              </div>
            )}
            {isEmergencyRoute && (
              <div className="mt-2 text-xs flex items-center">
                <span className="text-red-500 font-medium">
                  Emergency Route Active
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
