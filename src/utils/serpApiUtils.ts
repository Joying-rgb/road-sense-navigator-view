
// SERP API key
export const SERP_API_KEY = "c2242a49c3eda3248a47be63d8347d1ad9aa10ea0eef1d2326775c566ac0b6cd";

export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
}

// Function to get place suggestions using the Google Maps Autocomplete engine
export async function getPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  
  try {
    // Using the Google Maps Autocomplete engine with UAE region (gl=ae)
    const response = await fetch(`https://serpapi.com/search.json?engine=google_maps_autocomplete&q=${encodeURIComponent(query)}&gl=ae&api_key=${SERP_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`SERP API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("SERP API Autocomplete response:", data);
    
    // Extract suggestions from the autocomplete response
    if (data.suggestions && data.suggestions.length > 0) {
      return data.suggestions.map((suggestion: any, index: number) => {
        // For place type suggestions with coordinates
        if (suggestion.type === 'place' && suggestion.latitude && suggestion.longitude) {
          return {
            id: suggestion.data_id || `place-${index}-${Date.now()}`,
            name: suggestion.value,
            address: suggestion.subtext || "",
            formattedAddress: suggestion.subtext ? `${suggestion.value}, ${suggestion.subtext}` : suggestion.value,
            latitude: suggestion.latitude,
            longitude: suggestion.longitude
          };
        } else {
          // For keyword type or suggestions without coordinates
          return {
            id: `suggestion-${index}-${Date.now()}`,
            name: suggestion.value,
            address: suggestion.subtext || "",
            formattedAddress: suggestion.subtext ? `${suggestion.value}, ${suggestion.subtext}` : suggestion.value
          };
        }
      });
    } else {
      console.log("No suggestions found for query:", query);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch place suggestions from SERP API:", error);
    throw error;
  }
}

export interface DirectionStep {
  instruction: string;
  distance: string;
  time: string;
  maneuver?: string;
}

export interface DirectionsResult {
  origin: string;
  destination: string;
  totalDistance: string;
  totalTime: string;
  steps: DirectionStep[];
  mapUrl: string;
}

// Function to get directions between two places
export async function getDirections(origin: string, destination: string): Promise<DirectionsResult> {
  // Form the search query for directions
  const searchQuery = `${origin} to ${destination} directions`;
  
  try {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&gl=ae&api_key=${SERP_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`SERP API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Direction API response:", data);
    
    // Process directions data from SERP API
    // In a real implementation, we'd extract the steps from the SERP API response
    // For now, we'll use placeholder steps based on the API's response
    
    // Google Maps embed URL for the map display
    const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;
    
    // Extract directions from SERP API response if available
    let steps: DirectionStep[] = [];
    let totalDistance = "Unknown";
    let totalTime = "Unknown";
    
    if (data.directions) {
      const directions = data.directions;
      
      // Extract total distance and time if available
      if (directions.routes && directions.routes.length > 0) {
        const route = directions.routes[0];
        totalDistance = route.distance || "Unknown";
        totalTime = route.time || "Unknown";
        
        // Extract steps if available
        if (route.legs && route.legs.length > 0) {
          const leg = route.legs[0];
          steps = leg.steps.map((step: any) => {
            return {
              instruction: step.html_instructions || "Continue to destination",
              distance: step.distance || "Unknown",
              time: step.duration || "Unknown",
              maneuver: determineManeuver(step.html_instructions || "")
            };
          });
        }
      }
    }
    
    // If no steps were found, provide at least one step to show directions exist
    if (steps.length === 0) {
      steps = [
        { 
          instruction: `Navigate from ${origin} to ${destination}`, 
          distance: totalDistance, 
          time: totalTime,
          maneuver: "straight" 
        },
        { 
          instruction: "Arrive at destination", 
          distance: "0 km", 
          time: "0 min",
          maneuver: "arrive" 
        }
      ];
    }
    
    return {
      origin,
      destination,
      totalDistance,
      totalTime,
      steps,
      mapUrl
    };
  } catch (error) {
    console.error("Failed to fetch directions from SERP API:", error);
    throw new Error("Failed to get directions");
  }
}

// Helper function to determine maneuver type from instruction text
function determineManeuver(instruction: string): string {
  const lowerInstruction = instruction.toLowerCase();
  
  if (lowerInstruction.includes("turn right")) return "turn-right";
  if (lowerInstruction.includes("turn left")) return "turn-left";
  if (lowerInstruction.includes("merge")) return "merge";
  if (lowerInstruction.includes("take exit") || lowerInstruction.includes("take the exit")) return "ramp-right";
  if (lowerInstruction.includes("keep left") || lowerInstruction.includes("stay left")) return "fork-left";
  if (lowerInstruction.includes("keep right") || lowerInstruction.includes("stay right")) return "fork-right";
  if (lowerInstruction.includes("arrive") || lowerInstruction.includes("destination")) return "arrive";
  if (lowerInstruction.includes("continue straight") || lowerInstruction.includes("head")) return "straight";
  
  return "straight"; // Default maneuver
}
