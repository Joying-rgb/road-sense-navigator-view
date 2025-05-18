
import VideoFeed from "@/components/VideoFeed";
import NavigationMap from "@/components/NavigationMap";
import WeatherDisplay from "@/components/WeatherDisplay";
import LanePositionIndicator from "@/components/LanePositionIndicator";
import ProximityAlert from "@/components/ProximityAlert";
import RecordingsList from "@/components/RecordingsList";
import EmergencyFeature from "@/components/EmergencyFeature";
import { AlertTriangle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Smart Route Vision Pilot</h1>
          
          {/* Emergency button in header for easier access */}
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
            onClick={() => {
              document.getElementById('emergency-section')?.scrollIntoView({
                behavior: 'smooth'
              });
            }}
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency
          </Button>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video feed takes up 2/3 of the space on large screens */}
          <div className="lg:col-span-2">
            <VideoFeed />
          </div>
          
          {/* Right column with navigation section and weather */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Navigation className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Navigation Center</h2>
              </div>
              <NavigationMap />
            </div>
            <WeatherDisplay />
          </div>
          
          {/* Bottom row split into sections */}
          <div>
            <LanePositionIndicator />
          </div>
          <div>
            <ProximityAlert 
              onRecordingStart={handleProximityRecordingStart}
              onRecordingStop={handleProximityRecordingStop}
            />
          </div>
          <div id="emergency-section">
            <EmergencyFeature />
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
