
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoOff, Video, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface Detection {
  id: number;
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

const VideoFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  
  // Dummy detections for UI preview
  useEffect(() => {
    // In a real app, these would come from AI model inference
    const dummyDetections: Detection[] = [
      { 
        id: 1, 
        class: 'car', 
        confidence: 0.92, 
        bbox: [50, 100, 200, 150] 
      },
      { 
        id: 2, 
        class: 'pedestrian', 
        confidence: 0.78, 
        bbox: [300, 200, 100, 180] 
      },
      { 
        id: 3, 
        class: 'traffic light', 
        confidence: 0.85, 
        bbox: [450, 50, 60, 100] 
      }
    ];
    
    const filteredDetections = dummyDetections.filter(
      d => d.confidence >= confidenceThreshold
    );
    
    setDetections(filteredDetections);
  }, [confidenceThreshold]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSource(url);
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleRecording = () => {
    // In a real app, this would start/stop recording
    setIsRecording(!isRecording);
  };

  useEffect(() => {
    // Drawing detections on canvas
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (isPlaying && detections.length > 0) {
          // Draw bounding boxes
          detections.forEach(detection => {
            const [x, y, width, height] = detection.bbox;
            
            // Color based on class
            let color;
            switch (detection.class) {
              case 'car':
                color = '#0EA5E9'; // blue
                break;
              case 'pedestrian':
                color = '#F97316'; // orange
                break;
              default:
                color = '#10B981'; // green
            }
            
            // Draw rectangle
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            
            // Draw label background
            ctx.fillStyle = color;
            const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(x, y - 20, textWidth + 10, 20);
            
            // Draw label text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px monospace';
            ctx.fillText(label, x + 5, y - 5);
          });
        }
      }
    }
  }, [detections, isPlaying]);

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Video Feed & Detection</CardTitle>
        <div className="flex items-center space-x-2">
          {isRecording && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse-recording mr-1"></span>
              Recording
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleRecording}
            className={cn(isRecording ? "bg-red-500/20" : "")}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 relative">
        {!videoSource ? (
          <div className="flex flex-col items-center justify-center h-[400px] bg-muted rounded-md">
            <VideoOff size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No video source selected</p>
            <label htmlFor="video-upload" className="cursor-pointer">
              <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md">
                Select Video File
              </div>
              <input 
                id="video-upload" 
                type="file" 
                accept="video/*" 
                onChange={handleFileSelect}
                className="hidden" 
              />
            </label>
          </div>
        ) : (
          <div className="relative">
            <video 
              ref={videoRef} 
              src={videoSource} 
              className="w-full h-[400px] object-cover rounded-md bg-black"
            />
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={400} 
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={togglePlayback}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoFeed;
