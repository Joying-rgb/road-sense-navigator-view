
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type LanePosition = "centered" | "left" | "right";

const LanePositionIndicator = () => {
  // In a real app, this would receive data from lane detection algorithm
  const lanePosition: LanePosition = "centered";
  
  const renderPosition = () => {
    switch (lanePosition) {
      case "left":
        return (
          <div className="relative h-20 w-full bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-y-0 left-1/4 w-0.5 bg-white"></div>
            <div className="absolute inset-y-0 right-1/4 w-0.5 bg-white"></div>
            <div className="absolute bottom-3 left-3 h-10 w-16 bg-primary rounded-md"></div>
          </div>
        );
      case "right":
        return (
          <div className="relative h-20 w-full bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-y-0 left-1/4 w-0.5 bg-white"></div>
            <div className="absolute inset-y-0 right-1/4 w-0.5 bg-white"></div>
            <div className="absolute bottom-3 right-3 h-10 w-16 bg-primary rounded-md"></div>
          </div>
        );
      default: // centered
        return (
          <div className="relative h-20 w-full bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-y-0 left-1/4 w-0.5 bg-white"></div>
            <div className="absolute inset-y-0 right-1/4 w-0.5 bg-white"></div>
            <div className="absolute bottom-3 left-0 right-0 mx-auto h-10 w-16 bg-green-500 rounded-md"></div>
          </div>
        );
    }
  };
  
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Lane Position</CardTitle>
      </CardHeader>
      <CardContent>
        {renderPosition()}
        <div className="mt-2 text-center">
          <span className="data-label">Status</span>
          <p className="font-medium">
            {lanePosition === "centered" ? (
              <span className="text-green-500">Centered</span>
            ) : lanePosition === "left" ? (
              <span className="text-accent">Veering Left</span>
            ) : (
              <span className="text-accent">Veering Right</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanePositionIndicator;
