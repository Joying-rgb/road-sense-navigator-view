import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Route, AlertTriangle, Navigation, ArrowRight, MapPin } from "lucide-react";
import { getDirections, DirectionStep, DirectionsResult } from "@/utils/serpApiUtils";
import { PlaceSearch } from "@/components/PlaceSearch";
import { PlaceSuggestion } from "@/utils/serpApiUtils";

interface NavigationState {
  origin: string;
  destination: string;
  previousDestination?: string;
}

interface NavigationMapProps {
  navigationState?: NavigationState;
  setNavigationState?: React.Dispatch<React.SetStateAction<NavigationState>>;
}

interface Location {
  lat: number;
  lng: number;
}

// Mock current location that moves along the route
const simulateMovement = (steps: DirectionStep[], progress: number): Location => {
  // In a real app, this would be GPS data
  return { lat: 37.7749 + (progress * 0.01), lng: -122.4194 + (progress * 0.01) };
};

// Export the DirectionStep type so it can be imported by VideoFeed
export type NavigationStep = DirectionStep;

const NavigationMap = ({ navigationState, setNavigationState }: NavigationMapProps) => {
  const [origin, setOrigin] = useState("");
  const [originSuggestion, setOriginSuggestion] = useState<PlaceSuggestion | undefined>(undefined);
  const [destination, setDestination] = useState("");
  const [destinationSuggestion, setDestinationSuggestion] = useState<PlaceSuggestion | undefined>(undefined);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState<DirectionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [co2Saved, setCo2Saved] = useState<number>(0);
  const [routeActive, setRouteActive] = useState(false);
  const [isEmergencyRoute, setIsEmergencyRoute] = useState(false);
  const [destinationReached, setDestinationReached] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState<string>("0 km");
  const [timeRemaining, setTimeRemaining] = useState<string>("0 min");
  const [currentLocation, setCurrentLocation] = useState<Location>({ lat: 37.7749, lng: -122.4194 });
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stepIntervalRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
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
  }, [navigationState, destination]);
  
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
        setProgressPercent(0);
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
  
  // Function to calculate the total distance and time from the current step to the end
  const calculateRemainingDistanceAndTime = (steps: DirectionStep[], currentIdx: number) => {
    if (!steps || steps.length === 0 || currentIdx >= steps.length) {
      return { distance: "0 km", time: "0 min" };
    }
    
    let totalDistanceKm = 0;
    let totalTimeMin = 0;
    
    for (let i = currentIdx; i < steps.length; i++) {
      // Extract numeric values from strings like "5.2 km" and "3 min"
      const distanceMatch = steps[i].distance.match(/(\d+\.?\d*)/);
      const timeMatch = steps[i].time.match(/(\d+)/);
      
      if (distanceMatch) totalDistanceKm += parseFloat(distanceMatch[0]);
      if (timeMatch) totalTimeMin += parseInt(timeMatch[0]);
    }
    
    return { 
      distance: `${totalDistanceKm.toFixed(1)} km`, 
      time: `${totalTimeMin} min` 
    };
  };
  
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
    setProgressPercent(0);
    
    try {
      // Get directions from SERP API
      const directionsResult = await getDirections(currentOrigin, destination);
      
      if (!directionsResult) {
        throw new Error("Failed to get directions");
      }
      
      setDirections(directionsResult);
      
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
      
      // Set the navigation steps and map URL
      setNavigationSteps(directionsResult.steps);
      setMapUrl(directionsResult.mapUrl);
      setCurrentStepIndex(0);
      
      // Calculate initial remaining distance and time
      const { distance, time } = calculateRemainingDistanceAndTime(directionsResult.steps, 0);
      setDistanceRemaining(distance);
      setTimeRemaining(time);
      
      // Calculate estimated CO2 savings based on route
      // In a real app, this would be based on vehicle type, route efficiency, etc.
      const routeDistance = directionsResult.totalDistance.match(/(\d+\.?\d*)/);
      const distanceKm = routeDistance ? parseFloat(routeDistance[0]) : 0;
      
      const estimatedCo2Saved = Math.round(distanceKm * 0.12 * 100) / 100; // 0.12kg CO2 saved per km (example)
      setCo2Saved(estimatedCo2Saved);
      
      // Set route as active and dispatch event with navigation steps
      setRouteActive(true);
      window.dispatchEvent(new CustomEvent('navigation:route-calculated', { 
        detail: {
          steps: directionsResult.steps
        }
      }));
      
      // Start navigation simulation
      startNavigationSimulation(directionsResult.steps);
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
    setProgressPercent(0);
    
    // Set route as inactive and dispatch event
    setRouteActive(false);
    window.dispatchEvent(new CustomEvent('navigation:route-cancelled'));
    
    // Clear the intervals if they exist
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Update parent state if available
    if (setNavigationState) {
      setNavigationState(prev => ({
        ...prev,
        destination: ""
      }));
    }
  };
  
  const startNavigationSimulation = (steps: DirectionStep[]) => {
    // Reset index and destination reached status
    setCurrentStepIndex(0);
    setDestinationReached(false);
    setProgressPercent(0);
    
    // Clear existing intervals if any
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
    }
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Update progress more frequently (every 1 second)
    progressIntervalRef.current = window.setInterval(() => {
      setProgressPercent(prev => {
        const stepDuration = 8; // seconds per step
        const totalSteps = steps.length - 1; // subtract 1 because last step is arrival
        const incrementPerSecond = 100 / (totalSteps * stepDuration);
        
        // Calculate new progress
        const newProgress = Math.min(prev + incrementPerSecond, 100);
        
        // Update distance and time remaining based on progress
        if (steps.length > 0) {
          const progressRatio = newProgress / 100;
          const completedStepIndex = Math.floor(progressRatio * (steps.length - 1));
          const partialStep = progressRatio * (steps.length - 1) - completedStepIndex;
          
          // Calculate remaining distance and time for all future steps
          const { distance, time } = calculateRemainingDistanceAndTime(steps, completedStepIndex);
          setDistanceRemaining(distance);
          setTimeRemaining(time);
          
          // Update current location simulation
          setCurrentLocation(simulateMovement(steps, newProgress));
        }
        
        // Move to the next step when we reach certain thresholds
        const stepsProgress = (newProgress * (steps.length - 1) / 100);
        const nextStepIndex = Math.floor(stepsProgress);
        
        if (nextStepIndex > currentStepIndex) {
          setCurrentStepIndex(nextStepIndex);
        }
        
        // If we've reached 100%, stop the interval and show destination reached
        if (newProgress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          
          // Show destination reached message
          setDestinationReached(true);
          setCurrentStepIndex(steps.length - 1); // Show final instruction
          toast.success("You have reached your destination!");
        }
        
        return newProgress;
      });
    }, 1000);
  };
  
  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info("Getting your current location...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // In a real app, we would reverse geocode to get the address
          // For now, we'll just use "Current Location" and log the coordinates
          console.log(`Current location: ${latitude}, ${longitude}`);
          setOrigin("Current Location");
          
          if (setNavigationState) {
            setNavigationState(prev => ({
              ...prev,
              origin: "Current Location"
            }));
          }
          
          toast.success("Current location set");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get your location. Please enter it manually.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Helper to render the maneuver icon
  const renderManeuverIcon = (maneuver?: string) => {
    switch (maneuver) {
      case 'turn-right':
        return <ArrowRight className="h-5 w-5 -rotate-90" />;
      case 'turn-left':
        return <ArrowRight className="h-5 w-5 rotate-90" />;
      case 'merge':
        return <ArrowRight className="h-5 w-5 rotate-45" />;
      case 'ramp-right':
        return <ArrowRight className="h-5 w-5 -rotate-45" />;
      case 'ramp-left':
        return <ArrowRight className="h-5 w-5 rotate-45" />;
      case 'fork-right':
        return <ArrowRight className="h-5 w-5 -rotate-45" />;
      case 'fork-left':
        return <ArrowRight className="h-5 w-5 rotate-45" />;
      case 'straight':
        return <ArrowRight className="h-5 w-5" />;
      case 'arrive':
        return <MapPin className="h-5 w-5" />;
      default:
        return <Route className="h-5 w-5" />;
    }
  };

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRouteSearch} className="mb-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex gap-2">
              <PlaceSearch
                placeholder="Current Location" 
                value={origin}
                onChange={(value, suggestion) => {
                  setOrigin(value);
                  setOriginSuggestion(suggestion);
                  if (setNavigationState) {
                    setNavigationState(prev => ({
                      ...prev,
                      origin: value
                    }));
                  }
                }}
                className="flex-1"
                inputClassName="bg-muted"
              />
              <Button 
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGetCurrentLocation}
                title="Get current location"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <PlaceSearch
                placeholder="Destination" 
                value={destination}
                onChange={(value, suggestion) => {
                  setDestination(value);
                  setDestinationSuggestion(suggestion);
                  if (setNavigationState) {
                    setNavigationState(prev => ({
                      ...prev,
                      destination: value
                    }));
                  }
                }}
                className="w-full"
                inputClassName="bg-muted"
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
        {navigationSteps.length > 0 && currentStepIndex < navigationSteps.length && navigationSteps[currentStepIndex] && (
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
                {renderManeuverIcon(navigationSteps[currentStepIndex].maneuver)}
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
            
            {/* Real-time progress bar */}
            <div className="mt-3">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isEmergencyRoute ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <div className="flex items-center">
                  <Navigation className="h-3 w-3 mr-1" />
                  {destinationReached ? "Arrived" : "In progress"}
                </div>
                {!destinationReached && (
                  <div className="flex space-x-2">
                    <span>{distanceRemaining} remaining</span>
                    <span>•</span>
                    <span>{timeRemaining} left</span>
                  </div>
                )}
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
