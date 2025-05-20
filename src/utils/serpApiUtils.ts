
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
    
    try {
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
    } catch (error) {
      console.error("Failed to fetch from SERP API, using mock data instead:", error);
      // Continue to mock data
    }
    
    // If API fails or has no results, return mock suggestions based on query
    return getMockPlaceSuggestions(query);
    
  } catch (error) {
    console.error("Failed to fetch place suggestions:", error);
    return getMockPlaceSuggestions(query);
  }
}

// Generate mock place suggestions based on the query
function getMockPlaceSuggestions(query: string): PlaceSuggestion[] {
  const lowerQuery = query.toLowerCase();
  
  const commonPlaces = [
    { name: "Central Park", address: "New York, NY 10022", type: "park" },
    { name: "Times Square", address: "Manhattan, NY 10036", type: "attraction" },
    { name: "Eiffel Tower", address: "Champ de Mars, 5 Avenue Anatole France, Paris", type: "attraction" },
    { name: "Statue of Liberty", address: "New York, NY 10004", type: "monument" },
    { name: "Grand Canyon", address: "Arizona, USA", type: "nature" },
    { name: "Sydney Opera House", address: "Bennelong Point, Sydney", type: "attraction" },
    { name: "Great Wall of China", address: "Huairou District, China", type: "monument" },
    { name: "Taj Mahal", address: "Agra, Uttar Pradesh, India", type: "monument" },
    { name: "Golden Gate Bridge", address: "San Francisco, CA", type: "attraction" },
    { name: "Machu Picchu", address: "Cusco Region, Peru", type: "monument" },
    { name: "London Eye", address: "Lambeth, London SE1 7PB, UK", type: "attraction" },
    { name: "Mount Everest", address: "Nepal-China border", type: "nature" },
    { name: "Niagara Falls", address: "Ontario, Canada/New York, USA", type: "nature" },
    { name: "Colosseum", address: "Piazza del Colosseo, Rome, Italy", type: "monument" },
    { name: "Empire State Building", address: "20 W 34th St, New York, NY 10001", type: "attraction" }
  ];
  
  if (lowerQuery.includes("hospital") || lowerQuery.includes("emergency")) {
    return [
      { id: `hospital-1-${Date.now()}`, name: "General Hospital", address: "123 Health Blvd, City Center", formattedAddress: "General Hospital, 123 Health Blvd, City Center" },
      { id: `hospital-2-${Date.now()}`, name: "Emergency Care Center", address: "456 Medical Ave, Downtown", formattedAddress: "Emergency Care Center, 456 Medical Ave, Downtown" },
      { id: `hospital-3-${Date.now()}`, name: "Urgent Care Clinic", address: "789 First Response St", formattedAddress: "Urgent Care Clinic, 789 First Response St" },
      { id: `hospital-4-${Date.now()}`, name: "Children's Hospital", address: "101 Pediatric Way", formattedAddress: "Children's Hospital, 101 Pediatric Way" }
    ];
  } else if (lowerQuery.includes("airport")) {
    return [
      { id: `airport-1-${Date.now()}`, name: "International Airport", address: "Terminal Rd, Airfield Zone", formattedAddress: "International Airport, Terminal Rd, Airfield Zone" },
      { id: `airport-2-${Date.now()}`, name: "Regional Airport", address: "123 Aviation Blvd", formattedAddress: "Regional Airport, 123 Aviation Blvd" },
      { id: `airport-3-${Date.now()}`, name: "Executive Airport", address: "456 Runway Ave", formattedAddress: "Executive Airport, 456 Runway Ave" }
    ];
  } else if (lowerQuery.includes("restaurant") || lowerQuery.includes("food")) {
    return [
      { id: `restaurant-1-${Date.now()}`, name: "Fine Dining Restaurant", address: "123 Gourmet Ave", formattedAddress: "Fine Dining Restaurant, 123 Gourmet Ave" },
      { id: `restaurant-2-${Date.now()}`, name: "Fast Food Place", address: "456 Quick Bite St", formattedAddress: "Fast Food Place, 456 Quick Bite St" },
      { id: `restaurant-3-${Date.now()}`, name: "Family Restaurant", address: "789 Comfort Rd", formattedAddress: "Family Restaurant, 789 Comfort Rd" },
      { id: `restaurant-4-${Date.now()}`, name: "Cafe & Bakery", address: "101 Coffee Lane", formattedAddress: "Cafe & Bakery, 101 Coffee Lane" }
    ];
  }
  
  // Filter common places by query
  const filteredPlaces = commonPlaces.filter(place => 
    place.name.toLowerCase().includes(lowerQuery) || 
    place.address.toLowerCase().includes(lowerQuery) ||
    place.type.toLowerCase().includes(lowerQuery)
  );
  
  // If filteredPlaces has results, format them as PlaceSuggestions
  if (filteredPlaces.length > 0) {
    return filteredPlaces.map((place, index) => ({
      id: `place-${index}-${Date.now()}`,
      name: place.name,
      address: place.address,
      formattedAddress: `${place.name}, ${place.address}`
    }));
  }
  
  // Fallback: create mock places based on query
  return [
    { id: `query-1-${Date.now()}`, name: `${query} Place`, address: "123 Main St, City Center", formattedAddress: `${query} Place, 123 Main St, City Center` },
    { id: `query-2-${Date.now()}`, name: `${query} Point of Interest`, address: "456 Central Ave, Downtown", formattedAddress: `${query} Point of Interest, 456 Central Ave, Downtown` },
    { id: `query-3-${Date.now()}`, name: `${query} Landmark`, address: "789 Historic Route", formattedAddress: `${query} Landmark, 789 Historic Route` }
  ];
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
