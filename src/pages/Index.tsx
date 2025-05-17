
import VideoFeed from "@/components/VideoFeed";
import NavigationMap from "@/components/NavigationMap";
import WeatherDisplay from "@/components/WeatherDisplay";
import LanePositionIndicator from "@/components/LanePositionIndicator";
import ProximityAlert from "@/components/ProximityAlert";
import RecordingsList from "@/components/RecordingsList";
import { useState } from "react";

const Index = () => {
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  
  // Handlers for proximity-based recording
  const handleProximityRecordingStart = () => {
    setIsRecordingActive(true);
    // In a real application, this would trigger the VideoFeed component to start recording
  };
  
  const handleProximityRecordingStop = () => {
    setIsRecordingActive(false);
    // In a real application, this would trigger the VideoFeed component to stop and save recording
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Smart Route Vision Pilot</h1>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video feed takes up 2/3 of the space on large screens */}
          <div className="lg:col-span-2">
            <VideoFeed isEmergencyRecording={isRecordingActive} />
          </div>
          
          {/* Right column with navigation and weather */}
          <div className="space-y-6">
            <NavigationMap />
            <WeatherDisplay />
          </div>
          
          {/* Bottom row split into 3 columns */}
          <div>
            <LanePositionIndicator />
          </div>
          <div>
            <ProximityAlert 
              onRecordingStart={handleProximityRecordingStart}
              onRecordingStop={handleProximityRecordingStop}
            />
          </div>
          <div>
            <RecordingsList />
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border mt-8">
        <div className="container py-4">
          <p className="text-sm text-muted-foreground text-center">
            Smart Route Vision Pilot v1.0 - Vehicle Navigation & Safety System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
