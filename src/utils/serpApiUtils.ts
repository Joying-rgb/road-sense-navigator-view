
// SERP API key
export const SERP_API_KEY = "c2242a49c3eda3248a47be63d8347d1ad9aa10ea0eef1d2326775c566ac0b6cd";

export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  formattedAddress: string;
}

// Function to get place suggestions
export async function getPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  
  try {
    // For real implementation, we would call SERP API with the query
    // Since direct API calls might be rate-limited, we'll use a proxy or mock for demonstration
    
    const response = await fetch(`https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`SERP API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract place suggestions from the response
    if (data.local_results) {
      return data.local_results.map((place: any, index: number) => ({
        id: `place-${index}-${Date.now()}`,
        name: place.title,
        address: place.address || "",
        formattedAddress: place.address || place.title
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch place suggestions:", error);
    return [];
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
export async function getDirections(origin: string, destination: string): Promise<DirectionsResult | null> {
  try {
    // Form the search query for directions
    const searchQuery = `${origin} to ${destination} directions`;
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${SERP_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`SERP API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process directions data
    // In a real implementation, we'd extract the steps from the SERP API response
    // For now, we'll use mock data based on destinations
    
    // Google Maps embed URL for the map display
    const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;
    
    // For demo purposes, generate steps based on destination keywords
    const steps = generateDirectionSteps(destination);
    
    // Calculate totals from steps
    const totalDistance = calculateTotalDistance(steps);
    const totalTime = calculateTotalTime(steps);
    
    return {
      origin,
      destination,
      totalDistance,
      totalTime,
      steps,
      mapUrl
    };
  } catch (error) {
    console.error("Failed to fetch directions:", error);
    return null;
  }
}

// Helper function to generate realistic steps based on destination
function generateDirectionSteps(destination: string): DirectionStep[] {
  const lowerDest = destination.toLowerCase();
  
  if (lowerDest.includes("hospital") || lowerDest.includes("emergency")) {
    return [
      { instruction: "Head north on current road", distance: "0.3 km", time: "1 min" },
      { instruction: "Turn right onto Emergency Lane", distance: "0.5 km", time: "2 min", maneuver: "turn-right" },
      { instruction: "Take the fast lane on Highway 101", distance: "4.2 km", time: "3 min", maneuver: "merge" },
      { instruction: "Take emergency exit toward Hospital", distance: "0.5 km", time: "1 min", maneuver: "ramp-right" },
      { instruction: "Turn left at the Emergency entrance", distance: "0.2 km", time: "1 min", maneuver: "turn-left" },
      { instruction: "Arrive at the Emergency Department", distance: "0 km", time: "0 min", maneuver: "arrive" }
    ];
  } else if (lowerDest.includes("airport")) {
    return [
      { instruction: "Head east on Main St", distance: "1.2 km", time: "3 min" },
      { instruction: "Take the ramp onto Airport Highway", distance: "5.8 km", time: "6 min", maneuver: "ramp-right" },
      { instruction: "Keep left at the fork toward Terminals", distance: "2.1 km", time: "2 min", maneuver: "fork-left" },
      { instruction: "Take exit for Departures", distance: "0.7 km", time: "1 min", maneuver: "ramp-right" },
      { instruction: "Arrive at the Airport Terminal", distance: "0 km", time: "0 min", maneuver: "arrive" }
    ];
  } else if (lowerDest.includes("downtown") || lowerDest.includes("city center")) {
    return [
      { instruction: "Head north on Main St", distance: "0.5 km", time: "2 min" },
      { instruction: "Turn right onto Broadway Ave", distance: "1.2 km", time: "4 min", maneuver: "turn-right" },
      { instruction: "Continue onto Downtown Plaza", distance: "0.8 km", time: "3 min", maneuver: "straight" },
      { instruction: "Turn left onto Market St", distance: "0.6 km", time: "2 min", maneuver: "turn-left" },
      { instruction: "Arrive at Downtown City Center", distance: "0 km", time: "0 min", maneuver: "arrive" }
    ];
  } else if (lowerDest.includes("mall") || lowerDest.includes("shopping")) {
    return [
      { instruction: "Head west on Main St", distance: "0.7 km", time: "2 min" },
      { instruction: "Turn left onto Shopping Blvd", distance: "1.1 km", time: "3 min", maneuver: "turn-left" },
      { instruction: "Continue straight past the intersection", distance: "0.5 km", time: "1 min", maneuver: "straight" },
      { instruction: "Turn right into the Mall parking lot", distance: "0.2 km", time: "1 min", maneuver: "turn-right" },
      { instruction: "Arrive at Mall entrance", distance: "0 km", time: "0 min", maneuver: "arrive" }
    ];
  } else {
    // Default route
    return [
      { instruction: "Head north on Main St", distance: "0.5 km", time: "2 min" },
      { instruction: "Turn right onto Broadway Ave", distance: "1.2 km", time: "4 min", maneuver: "turn-right" },
      { instruction: "Take the ramp onto Highway 101", distance: "5.8 km", time: "6 min", maneuver: "ramp-right" },
      { instruction: "Keep left at the fork", distance: "2.3 km", time: "3 min", maneuver: "fork-left" },
      { instruction: "Take exit 25B toward destination", distance: "0.8 km", time: "1 min", maneuver: "ramp-right" },
      { instruction: "Turn right onto Market St", distance: "1.5 km", time: "5 min", maneuver: "turn-right" },
      { instruction: "Arrive at your destination", distance: "0 km", time: "0 min", maneuver: "arrive" }
    ];
  }
}

function calculateTotalDistance(steps: DirectionStep[]): string {
  let totalKm = 0;
  
  steps.forEach(step => {
    const kmMatch = step.distance.match(/(\d+\.?\d*)/);
    if (kmMatch && kmMatch[1]) {
      totalKm += parseFloat(kmMatch[1]);
    }
  });
  
  return `${totalKm.toFixed(1)} km`;
}

function calculateTotalTime(steps: DirectionStep[]): string {
  let totalMin = 0;
  
  steps.forEach(step => {
    const minMatch = step.time.match(/(\d+)/);
    if (minMatch && minMatch[1]) {
      totalMin += parseInt(minMatch[1]);
    }
  });
  
  if (totalMin >= 60) {
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hours} hr ${mins} min`;
  }
  
  return `${totalMin} min`;
}
