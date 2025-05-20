
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface DetectedVehicle {
  id: number;
  type: "car" | "truck" | "motorcycle" | "bus" | "bicycle";
  distance: number; // in meters
  speed: number; // in km/h
  trajectory: "approaching" | "departing" | "parallel";
  collisionRisk: number; // 0-1
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface LaneData {
  position: 'left' | 'centered' | 'right';
  confidence: number; // 0-1
  deviation: number; // deviation from lane center in pixels
  idealPosition: 'left' | 'centered' | 'right';
  score: number; // 0-100
}

export interface NavigationData {
  isNavigating: boolean;
  currentStep: number;
  totalSteps: number;
  nextManeuver?: string;
  distanceToNextManeuver?: string;
  timeToNextManeuver?: string;
  distanceRemaining?: string;
  timeRemaining?: string;
  destination?: string;
}

interface DetectionContextType {
  detectedVehicles: DetectedVehicle[];
  setDetectedVehicles: React.Dispatch<React.SetStateAction<DetectedVehicle[]>>;
  laneData: LaneData;
  setLaneData: React.Dispatch<React.SetStateAction<LaneData>>;
  navigationData: NavigationData;
  setNavigationData: React.Dispatch<React.SetStateAction<NavigationData>>;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (context === undefined) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};

interface DetectionProviderProps {
  children: ReactNode;
}

export const DetectionProvider = ({ children }: DetectionProviderProps) => {
  const [detectedVehicles, setDetectedVehicles] = useState<DetectedVehicle[]>([]);
  const [laneData, setLaneData] = useState<LaneData>({
    position: 'centered',
    confidence: 0.8,
    deviation: 0,
    idealPosition: 'centered',
    score: 100
  });
  const [navigationData, setNavigationData] = useState<NavigationData>({
    isNavigating: false,
    currentStep: 0,
    totalSteps: 0
  });

  // Listen for navigation events
  useEffect(() => {
    const handleRouteCalculated = (event: CustomEvent<{ steps: any[] }>) => {
      if (event.detail.steps?.length) {
        const steps = event.detail.steps;
        setNavigationData(prev => ({
          ...prev,
          isNavigating: true,
          currentStep: 0,
          totalSteps: steps.length,
          nextManeuver: steps[0].maneuver,
          distanceToNextManeuver: steps[0].distance,
          timeToNextManeuver: steps[0].time
        }));
      }
    };
    
    const handleRouteCancelled = () => {
      setNavigationData({
        isNavigating: false,
        currentStep: 0,
        totalSteps: 0
      });
    };
    
    window.addEventListener('navigation:route-calculated', handleRouteCalculated as EventListener);
    window.addEventListener('navigation:route-cancelled', handleRouteCancelled);
    
    return () => {
      window.removeEventListener('navigation:route-calculated', handleRouteCalculated as EventListener);
      window.removeEventListener('navigation:route-cancelled', handleRouteCancelled);
    };
  }, []);

  return (
    <DetectionContext.Provider 
      value={{ 
        detectedVehicles, 
        setDetectedVehicles,
        laneData,
        setLaneData,
        navigationData,
        setNavigationData
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};
