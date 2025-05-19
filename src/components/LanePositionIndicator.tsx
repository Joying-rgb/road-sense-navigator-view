
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { LanePosition, isLeftLane, isCenteredLane, isRightLane } from "@/utils/lanePositionTypes";

// Add type guard functions if not exported from utils/lanePositionTypes
const LanePositionIndicator = () => {
  const [currentPosition, setCurrentPosition] = useState<LanePosition>('centered');
  const [idealPosition, setIdealPosition] = useState<LanePosition>('centered');
  const [score, setScore] = useState(100);

  // Simulate lane position changes
  useEffect(() => {
    // Initial position calculation
    calculateIdealPosition();
    
    // Update lane position every 10 seconds
    const positionInterval = setInterval(() => {
      // Randomly change position occasionally
      if (Math.random() > 0.7) {
        const positions: LanePosition[] = ['left', 'centered', 'right'];
        const newPosition = positions[Math.floor(Math.random() * positions.length)];
        setCurrentPosition(newPosition);
      }
      
      // Recalculate ideal position
      calculateIdealPosition();
    }, 10000);
    
    // Score update every 3 seconds
    const scoreInterval = setInterval(() => {
      updateScore();
    }, 3000);
    
    return () => {
      clearInterval(positionInterval);
      clearInterval(scoreInterval);
    };
  }, []);
  
  // Calculate ideal lane position based on various factors
  const calculateIdealPosition = () => {
    // In a real app, this would consider traffic, route, obstacles, etc.
    // For demo, we'll use a simple algorithm
    
    // Example: If we're shifting from left to right lanes gradually
    if (isLeftLane(currentPosition)) {
      // If currently in left lane, suggest moving to center
      setIdealPosition('centered');
    } else if (isRightLane(currentPosition)) {
      // If currently in right lane, suggest staying there
      setIdealPosition('right');
    } else {
      // If currently centered, randomly suggest
      const suggestions: LanePosition[] = ['centered', 'right'];
      setIdealPosition(suggestions[Math.floor(Math.random() * suggestions.length)]);
    }
  };
  
  // Update lane positioning score
  const updateScore = () => {
    // In a real app, this would be based on lane discipline, following suggestions, etc.
    // For demo, we'll calculate it based on current vs ideal position
    
    let newScore = score;
    
    if (currentPosition === idealPosition) {
      // If in ideal position, increase score
      newScore = Math.min(100, score + 2);
    } else {
      // If not in ideal position, decrease score
      newScore = Math.max(60, score - 5);
    }
    
    setScore(newScore);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Lane Position</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`p-2 rounded-lg flex items-center justify-center border ${
            isLeftLane(currentPosition) ? 'bg-accent border-accent-foreground' : 'bg-muted border-transparent'
          }`}>
            <ChevronLeft className="h-6 w-6" />
            <span>Left</span>
          </div>
          <div className={`p-2 rounded-lg flex items-center justify-center border ${
            isCenteredLane(currentPosition) ? 'bg-accent border-accent-foreground' : 'bg-muted border-transparent'
          }`}>
            <span>Center</span>
          </div>
          <div className={`p-2 rounded-lg flex items-center justify-center border ${
            isRightLane(currentPosition) ? 'bg-accent border-accent-foreground' : 'bg-muted border-transparent'
          }`}>
            <span>Right</span>
            <ChevronRight className="h-6 w-6" />
          </div>
        </div>
        
        {currentPosition !== idealPosition && (
          <div className="bg-muted p-3 rounded-lg mb-4">
            <p className="text-sm font-medium mb-2">Suggested Lane Change:</p>
            <div className="flex items-center justify-center gap-4">
              {isLeftLane(idealPosition) && !isLeftLane(currentPosition) && (
                <div className="flex items-center text-primary">
                  <ArrowLeft className="mr-1 h-5 w-5" />
                  <span>Move Left</span>
                </div>
              )}
              
              {isRightLane(idealPosition) && !isRightLane(currentPosition) && (
                <div className="flex items-center text-primary">
                  <span>Move Right</span>
                  <ArrowRight className="ml-1 h-5 w-5" />
                </div>
              )}
              
              {isCenteredLane(idealPosition) && !isCenteredLane(currentPosition) && (
                <div className="flex items-center text-primary">
                  <span>Move to Center Lane</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <div className="w-full bg-muted rounded-full h-2.5 mb-1">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <span className="text-xs text-muted-foreground">
            Lane Discipline Score: {score}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanePositionIndicator;
