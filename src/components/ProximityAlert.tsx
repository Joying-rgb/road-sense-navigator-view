
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ProximityAlert = () => {
  // In a real app, this would receive data from proximity sensors or video analysis
  const [distance, setDistance] = useState(150); // Distance in cm
  const [isRecording, setIsRecording] = useState(false);
  
  // Simulating changing distances
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate distance changes
      setDistance(prev => {
        const newDistance = prev + (Math.random() > 0.5 ? 10 : -10);
        return Math.max(5, Math.min(200, newDistance));
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto recording based on proximity
  useEffect(() => {
    if (distance <= 10 && !isRecording) {
      setIsRecording(true);
      console.log("Started recording due to proximity");
    } else if (distance > 10 && isRecording) {
      setIsRecording(false);
      console.log("Stopped recording - safe distance reached");
    }
  }, [distance, isRecording]);
  
  // Determine safety level
  const getSafetyLevel = () => {
    if (distance <= 10) return "Critical";
    if (distance <= 50) return "Warning";
    if (distance <= 100) return "Caution";
    return "Safe";
  };
  
  // Get color based on safety level
  const getColorForSafetyLevel = () => {
    if (distance <= 10) return "bg-dashboard-red";
    if (distance <= 50) return "bg-dashboard-orange";
    if (distance <= 100) return "bg-yellow-500";
    return "bg-dashboard-green";
  };
  
  // Calculate progress percentage (inverse - closer = higher percentage)
  const proximityPercentage = Math.max(0, Math.min(100, (1 - distance / 200) * 100));
  
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Proximity Alert</span>
          {isRecording && (
            <span className="flex items-center text-xs font-normal text-dashboard-red">
              <span className="h-2 w-2 rounded-full bg-dashboard-red animate-pulse-recording mr-1"></span>
              Auto Recording
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <span className="data-label">Nearest Object</span>
          <span className={`font-medium ${distance <= 50 ? "text-dashboard-orange" : ""}`}>
            {distance} cm
          </span>
        </div>
        <Progress value={proximityPercentage} className={`h-2 ${getColorForSafetyLevel()}`} />
        <div className="mt-4 text-center">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium
            ${getSafetyLevel() === "Safe" ? "bg-green-500/20 text-green-500" :
              getSafetyLevel() === "Caution" ? "bg-yellow-500/20 text-yellow-500" :
              getSafetyLevel() === "Warning" ? "bg-dashboard-orange/20 text-dashboard-orange" :
              "bg-dashboard-red/20 text-dashboard-red"
            }`}
          >
            {getSafetyLevel()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProximityAlert;
