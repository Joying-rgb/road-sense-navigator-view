
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Video } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import { toast } from "sonner";

interface NearAccidentDetectionProps {
  videoData?: HTMLVideoElement | null;
  isEnabled: boolean;
  onNearAccidentDetected?: () => void;
}

const NearAccidentDetection = ({
  videoData,
  isEnabled,
  onNearAccidentDetected,
}: NearAccidentDetectionProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [nearAccidentDetected, setNearAccidentDetected] = useState(false);
  const [videoConnected, setVideoConnected] = useState(false);
  const detectionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  
  // Check if video source is valid and playing
  useEffect(() => {
    const checkVideoSource = () => {
      if (videoData) {
        // Check if video is valid and has dimensions
        const isValid = videoData.readyState >= 2 && 
                      videoData.videoWidth > 0 && 
                      videoData.videoHeight > 0;
        
        setVideoConnected(isValid);
        
        if (isValid && !isDetecting && isEnabled) {
          setIsDetecting(true);
          toast.info("Near-accident detection connected to video feed");
        } else if (!isValid && isDetecting) {
          setIsDetecting(false);
        }
      } else {
        setVideoConnected(false);
        setIsDetecting(false);
      }
    };
    
    // Check initially and then periodically
    checkVideoSource();
    const videoCheckInterval = setInterval(checkVideoSource, 3000);
    
    return () => {
      clearInterval(videoCheckInterval);
    };
  }, [videoData, isEnabled, isDetecting]);

  // Process video frames for accident detection
  useEffect(() => {
    if (!isEnabled || !videoData || !videoConnected) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      return;
    }

    // Only start detection if video is actually playing
    if (!videoData.paused) {
      setIsDetecting(true);
      
      // Create detection canvas if needed
      if (!detectionCanvasRef.current) {
        detectionCanvasRef.current = document.createElement('canvas');
      }
      
      // Set up detection interval
      detectionIntervalRef.current = window.setInterval(() => {
        processVideoFrame();
      }, 1000) as unknown as number;
    } else {
      setIsDetecting(false);
    }
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isEnabled, videoData, videoConnected]);
  
  // Process a single video frame for accident detection
  const processVideoFrame = async () => {
    if (!videoData || videoData.paused || !detectionCanvasRef.current) return;
    
    try {
      // Prepare canvas for processing
      const canvas = detectionCanvasRef.current;
      canvas.width = videoData.videoWidth;
      canvas.height = videoData.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Draw current video frame to canvas
      ctx.drawImage(videoData, 0, 0);
      
      // In a real implementation, we would process this frame with a ML model
      // For now, we'll use a more advanced simulation based on video activity
      
      // Get image data to analyze motion and complexity
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      
      // Calculate motion and complexity metrics
      // Higher complexity/changes = higher likelihood of near-accident
      let pixelChanges = 0;
      let totalBrightness = 0;
      
      // Sample pixels (for performance, we don't need to check every pixel)
      const sampleRate = 10; // Sample every 10th pixel
      const previousFrameData = new Uint8ClampedArray(data.length);
      
      for (let i = 0; i < data.length; i += 4 * sampleRate) {
        // Calculate brightness
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        totalBrightness += brightness;
        
        // Check for rapid changes (would be compared with previous frame in real impl)
        if (Math.abs(previousFrameData[i] - r) > 30 ||
            Math.abs(previousFrameData[i+1] - g) > 30 ||
            Math.abs(previousFrameData[i+2] - b) > 30) {
          pixelChanges++;
        }
      }
      
      // Store current frame data for next comparison
      previousFrameData.set(data);
      
      // Calculate metrics
      const avgBrightness = totalBrightness / (data.length / (4 * sampleRate));
      const changeRate = pixelChanges / (data.length / (4 * sampleRate));
      
      // Final risk score (0-1)
      // Higher change rate and moderate brightness often indicate accident risk
      let risk = Math.min(changeRate * 3, 1);
      
      // Factor in brightness (too dark or too bright might affect accuracy)
      if (avgBrightness < 30 || avgBrightness > 220) {
        risk *= 0.7; // Lower confidence if lighting is poor
      }
      
      // Add some randomness for demo purposes
      // In a real system this would be the ML model's confidence
      risk = risk * 0.8 + (Math.random() * 0.2);
      
      // Update detection confidence
      setDetectionConfidence(risk);
      
      // Trigger near accident detection if risk is high
      if (risk > 0.75 && !nearAccidentDetected) {
        setNearAccidentDetected(true);
        onNearAccidentDetected?.();
        
        // Log the detection
        console.log(`High risk near-accident detected: ${(risk * 100).toFixed(1)}% confidence`);
        
        // Reset after alert
        setTimeout(() => {
          setNearAccidentDetected(false);
        }, 5000);
      }
      
    } catch (error) {
      console.error("Error in accident detection:", error);
    }
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <Card className={`dashboard-card ${nearAccidentDetected ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Video className="h-4 w-4" />
          Near-Accident Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Video Source:</span>
            <span className="flex items-center">
              <span className={`h-2 w-2 rounded-full ${videoConnected ? 'bg-green-500' : 'bg-red-500'} mr-1.5`}></span>
              {videoConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Detection Status:</span>
            <span className="flex items-center">
              <span className={`h-2 w-2 rounded-full ${isDetecting ? 'bg-green-500' : 'bg-yellow-500'} mr-1.5`}></span>
              {isDetecting ? 'Active' : 'Standby'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Level:</span>
            <span 
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                detectionConfidence > 0.7 ? 'bg-red-500/20 text-red-500' : 
                detectionConfidence > 0.4 ? 'bg-yellow-500/20 text-yellow-500' : 
                'bg-green-500/20 text-green-500'
              }`}
            >
              {detectionConfidence > 0.7 ? 'High' : 
               detectionConfidence > 0.4 ? 'Medium' : 'Low'} 
              ({Math.round(detectionConfidence * 100)}%)
            </span>
          </div>
        </div>
        
        {nearAccidentDetected && (
          <Alert variant="destructive" className="mt-3 animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Near-Accident Detected!</AlertTitle>
            <AlertDescription>
              Potential collision risk detected. Please exercise caution.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NearAccidentDetection;
