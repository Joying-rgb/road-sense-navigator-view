import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoOff, Video, Play, Pause, Camera, ArrowRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import * as tf from "@tensorflow/tfjs";
import { toast } from "sonner";

// Load COCO-SSD model
import * as cocoSsd from "@tensorflow-models/coco-ssd";

interface Detection {
  id: number;
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

interface NavigationStep {
  instruction: string;
  distance: string;
  time: string;
}

interface WeatherInfo {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  temperature: number;
}

const VideoFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  
  // Navigation and environmental info
  const [currentNavStep, setCurrentNavStep] = useState<NavigationStep | null>(null);
  const [co2Saved, setCo2Saved] = useState(0);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>({
    condition: 'sunny',
    temperature: 22
  });
  
  // Model reference
  const model = useRef<cocoSsd.ObjectDetection | null>(null);
  
  // Animation frame reference
  const requestAnimationFrameRef = useRef<number | null>(null);
  
  // Load COCO-SSD model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        toast.info("Loading object detection model...");
        // Make sure TensorFlow backend is initialized
        await tf.ready();
        // Load the COCO-SSD model
        model.current = await cocoSsd.load();
        setIsModelLoaded(true);
        toast.success("Object detection model loaded successfully!");
      } catch (error) {
        console.error("Failed to load model:", error);
        toast.error("Failed to load object detection model. Please try again later.");
      }
    };

    loadModel();

    // Cleanup
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Stop webcam if active
      if (isWebcamActive && videoRef.current && videoRef.current.srcObject) {
        stopWebcam();
      }
      
      const url = URL.createObjectURL(file);
      setVideoSource(url);
      setIsWebcamActive(false);
      
      // Reset playing state
      setIsPlaying(false);
    }
  };

  const activateWebcam = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser doesn't support webcam access");
        return;
      }
      
      // Stop existing video playback if any
      if (videoRef.current) {
        videoRef.current.pause();
      }
      
      // Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      
      // Set stream as video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        setIsWebcamActive(true);
        setIsPlaying(true);
        setVideoSource(null); // Clear previous file source
        
        // Start detection
        startObjectDetection();
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast.error("Couldn't access webcam. Please check permissions.");
    }
  };
  
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
      setIsPlaying(false);
      
      // Stop detection loop
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
    }
  };

  // Function to detect objects in current video frame
  const detectObjects = async () => {
    if (!model.current || !videoRef.current || !canvasRef.current || 
        videoRef.current.paused || videoRef.current.ended || 
        !isModelLoaded || !isPlaying) {
      return;
    }
    
    const video = videoRef.current;
    
    try {
      // Only run detection if video is ready
      if (video.readyState === 4) {
        // Perform object detection
        const predictions = await model.current.detect(video);
        
        // Process and filter predictions
        const processedDetections: Detection[] = predictions
          .filter(pred => pred.score >= confidenceThreshold)
          .map((pred, index) => ({
            id: index,
            class: pred.class,
            confidence: pred.score,
            bbox: [pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]]
          }));
          
        setDetections(processedDetections);
        
        // Draw on canvas
        drawDetections(processedDetections);
      }
    } catch (error) {
      console.error("Detection error:", error);
    }
    
    // Continue detection loop
    requestAnimationFrameRef.current = requestAnimationFrame(detectObjects);
  };
  
  // Function to draw bounding boxes on canvas
  const drawDetections = (detects: Detection[]) => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each detection
    detects.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      
      // Set color based on object class
      let color;
      switch (detection.class.toLowerCase()) {
        case 'car':
        case 'truck':
        case 'bus':
          color = '#0EA5E9'; // blue
          break;
        case 'person':
          color = '#F97316'; // orange
          break;
        case 'bicycle':
        case 'motorcycle':
          color = '#A855F7'; // purple
          break;
        case 'traffic light':
          color = '#EF4444'; // red
          break;
        case 'stop sign':
          color = '#EF4444'; // red
          break;
        default:
          color = '#10B981'; // green
      }
      
      // Draw rectangle
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      ctx.fillStyle = color;
      const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 25, textWidth + 10, 25);
      
      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px monospace';
      ctx.fillText(label, x + 5, y - 7);
    });
  };

  // Start object detection loop
  const startObjectDetection = () => {
    if (requestAnimationFrameRef.current) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    }
    requestAnimationFrameRef.current = requestAnimationFrame(detectObjects);
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        
        // Stop detection loop
        if (requestAnimationFrameRef.current) {
          cancelAnimationFrame(requestAnimationFrameRef.current);
          requestAnimationFrameRef.current = null;
        }
      } else {
        videoRef.current.play();
        
        // Start detection loop
        startObjectDetection();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // When video is playing and model is loaded, run object detection
  useEffect(() => {
    if (isPlaying && isModelLoaded && !requestAnimationFrameRef.current) {
      startObjectDetection();
    }
    
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
    };
  }, [isPlaying, isModelLoaded]);
  
  const toggleRecording = () => {
    // In a real app, this would start/stop recording
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      toast.success("Recording started");
    } else {
      toast.success("Recording stopped and saved");
    }
  };

  // Simulate navigation updates
  useEffect(() => {
    if (isPlaying) {
      // Simulate receiving navigation updates
      const navSteps: NavigationStep[] = [
        { instruction: "Continue straight on Main St", distance: "0.5 km", time: "2 min" },
        { instruction: "Turn right onto Broadway Ave", distance: "1.2 km", time: "4 min" },
        { instruction: "Take the ramp to Highway 101", distance: "0.8 km", time: "2 min" },
        { instruction: "Merge left to Express Lane", distance: "5.3 km", time: "5 min" },
        { instruction: "Exit right toward Downtown", distance: "1.0 km", time: "3 min" },
      ];
      
      let stepIndex = 0;
      
      // Update navigation step every 10 seconds
      const navInterval = setInterval(() => {
        setCurrentNavStep(navSteps[stepIndex]);
        
        // Calculate CO2 savings based on current step (mock calculation)
        const distance = parseFloat(navSteps[stepIndex].distance.replace(" km", "")) || 0;
        setCo2Saved(prev => prev + distance * 0.12); // 0.12kg CO2 saved per km (example)
        
        // Update weather randomly sometimes
        if (Math.random() > 0.7) {
          const conditions: ('sunny' | 'cloudy' | 'rainy' | 'snowy')[] = ['sunny', 'cloudy', 'rainy', 'snowy'];
          setWeatherInfo({
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            temperature: Math.floor(Math.random() * 15) + 15 // 15-30°C
          });
        }
        
        stepIndex = (stepIndex + 1) % navSteps.length;
      }, 10000);
      
      return () => clearInterval(navInterval);
    }
  }, [isPlaying]);

  // Render the navigation guidance overlay
  const renderNavigationOverlay = () => {
    if (!currentNavStep) return null;
    
    return (
      <div className="absolute top-4 left-4 right-4 bg-black/70 rounded-lg p-3 text-white backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-full p-1.5">
            <ArrowRight size={18} />
          </div>
          <div className="flex-1">
            <p className="font-medium">{currentNavStep.instruction}</p>
            <div className="flex text-xs text-gray-300 mt-0.5 space-x-3">
              <span>{currentNavStep.distance}</span>
              <span>•</span>
              <span>{currentNavStep.time}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the CO2 savings and weather overlay
  const renderEnvironmentalOverlay = () => {
    return (
      <div className="absolute bottom-16 left-4 right-4 flex space-x-2">
        {/* CO2 Savings */}
        <div className="bg-black/70 rounded-lg p-3 text-white backdrop-blur-sm flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Leaf className="text-green-400 mr-2" size={18} />
              <h3 className="font-medium">CO₂ Savings</h3>
            </div>
            <div className="text-green-400 font-bold">{co2Saved.toFixed(2)} kg</div>
          </div>
          <div className="mt-1 text-xs text-gray-300">
            <p>Equivalent to {(co2Saved / 21 * 100).toFixed(1)}% of a tree's yearly CO₂ absorption</p>
          </div>
        </div>
        
        {/* Weather Info */}
        <div className="bg-black/70 rounded-lg p-3 text-white backdrop-blur-sm w-1/3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Weather</h3>
              <p className="capitalize text-xs">{weatherInfo.condition}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-xl">{weatherInfo.temperature}°</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Video Feed & Detection</CardTitle>
        <div className="flex items-center space-x-2">
          {isRecording && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse mr-1"></span>
              Recording
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleRecording}
            className={cn(isRecording ? "bg-destructive/20" : "")}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 relative">
        {!videoSource && !isWebcamActive ? (
          <div className="flex flex-col items-center justify-center h-[400px] bg-muted rounded-md">
            <VideoOff size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No video source selected</p>
            <div className="flex gap-2">
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
              <Button onClick={activateWebcam} variant="secondary">
                <Camera className="mr-2 h-4 w-4" />
                Use Webcam
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isModelLoaded ? 
                <p className="text-green-500">Object detection model loaded and ready</p> : 
                <p>Loading object detection model...</p>}
            </div>
          </div>
        ) : (
          <div className="relative">
            <video 
              ref={videoRef} 
              src={!isWebcamActive ? videoSource || undefined : undefined}
              className="w-full h-[400px] object-cover rounded-md bg-black"
              playsInline
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-md"
            />
            {/* Navigation overlay */}
            {isPlaying && currentNavStep && renderNavigationOverlay()}
            
            {/* Environmental info overlay */}
            {isPlaying && renderEnvironmentalOverlay()}
            
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={togglePlayback}
                disabled={isWebcamActive}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </Button>
              {isWebcamActive && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={stopWebcam}
                >
                  Stop Camera
                </Button>
              )}
            </div>
            <div className="absolute top-4 right-4">
              <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                {detections.length} objects detected
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoFeed;
