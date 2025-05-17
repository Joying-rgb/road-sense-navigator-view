
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";

const NavigationMap = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  
  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call a mapping API to plot the route
    console.log("Routing from", origin, "to", destination);
  };

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRouteSearch} className="mb-4">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Input
                placeholder="Current Location" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-muted"
              />
            </div>
            <div>
              <Input
                placeholder="Destination" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-muted"
              />
            </div>
            <Button type="submit" className="w-full">
              Find Route
            </Button>
          </div>
        </form>
        
        <div className="h-[250px] bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Map will be displayed here</p>
            <p className="text-xs text-muted-foreground mt-1">(Requires Map API Integration)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationMap;
