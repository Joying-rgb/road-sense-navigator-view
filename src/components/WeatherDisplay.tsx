
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, CloudRain, CloudSnow } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location: string;
  windSpeed?: number;
  visibility?: number;
}

const WeatherDisplay = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    humidity: 65,
    condition: 'sunny',
    location: 'Current Location',
    windSpeed: 12,
    visibility: 8
  });

  const [environmentalImpact, setEnvironmentalImpact] = useState({
    co2Saved: 0,
    fuelEfficiencyImpact: 'Good'
  });

  // In a real app, we would fetch weather data from an API
  useEffect(() => {
    // Simulate API call with sample data
    const fetchWeather = () => {
      // This would be replaced with actual API call
      setTimeout(() => {
        const conditions: ('sunny' | 'cloudy' | 'rainy' | 'snowy')[] = ['sunny', 'cloudy', 'rainy', 'snowy'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        const newWeather = {
          temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
          humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
          condition: randomCondition,
          location: 'Current Location',
          windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
          visibility: Math.floor(Math.random() * 8) + 3 // 3-10 km
        };
        
        setWeather(newWeather);
        
        // Calculate environmental impact based on weather conditions
        calculateEnvironmentalImpact(newWeather);
      }, 2000);
    };
    
    fetchWeather();
    // In real app, we would set up interval to refresh weather data
  }, []);
  
  const calculateEnvironmentalImpact = (weatherData: WeatherData) => {
    // This would be a more complex calculation in a real app
    // Based on weather conditions, vehicle type, driving habits, etc.
    
    let baseCo2Saved = 2.5; // Base CO2 savings (kg) for eco-driving
    
    // Adjust based on weather conditions
    if (weatherData.condition === 'rainy' || weatherData.condition === 'snowy') {
      baseCo2Saved *= 0.8; // Reduced efficiency in bad weather
    }
    
    // Adjust based on temperature (moderate temperatures are more efficient)
    const tempFactor = 1 - Math.abs(weatherData.temperature - 20) / 30;
    baseCo2Saved *= Math.max(0.7, tempFactor);
    
    // Adjust based on wind (headwind reduces efficiency)
    if (weatherData.windSpeed && weatherData.windSpeed > 15) {
      baseCo2Saved *= 0.85;
    }
    
    // Round to 2 decimal places
    const co2Saved = Math.round(baseCo2Saved * 100) / 100;
    
    // Determine qualitative efficiency impact
    let fuelEfficiencyImpact = 'Good';
    if (co2Saved < 1.5) {
      fuelEfficiencyImpact = 'Poor';
    } else if (co2Saved < 2.2) {
      fuelEfficiencyImpact = 'Moderate';
    }
    
    setEnvironmentalImpact({
      co2Saved,
      fuelEfficiencyImpact
    });
  };

  const renderWeatherIcon = () => {
    switch (weather.condition) {
      case 'rainy':
        return <CloudRain size={48} className="text-blue-400" />;
      case 'snowy':
        return <CloudSnow size={48} className="text-gray-200" />;
      default:
        return <CloudSun size={48} className="text-yellow-400" />;
    }
  };

  const getWeatherConditionText = () => {
    switch (weather.condition) {
      case 'sunny':
        return 'Clear & Sunny';
      case 'cloudy':
        return 'Cloudy';
      case 'rainy':
        return 'Rainy';
      case 'snowy':
        return 'Snowy';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Weather & Environmental</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {renderWeatherIcon()}
            <div className="ml-4">
              <h3 className="text-2xl font-bold">{weather.temperature}°C</h3>
              <p className="text-muted-foreground">{getWeatherConditionText()}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="data-label">Humidity</p>
            <p className="data-value">{weather.humidity}%</p>
            <p className="text-xs text-muted-foreground mt-1">{weather.location}</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-3 mt-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Wind Speed</p>
              <p className="text-muted-foreground text-sm">{weather.windSpeed} km/h</p>
            </div>
            <div>
              <p className="text-sm font-medium">Visibility</p>
              <p className="text-muted-foreground text-sm">{weather.visibility} km</p>
            </div>
            <div>
              <p className="text-sm font-medium">CO₂ Saved</p>
              <p className="text-green-500 text-sm font-medium">{environmentalImpact.co2Saved} kg/h</p>
            </div>
          </div>
          <div className="mt-2 bg-muted/50 rounded-full px-3 py-1 text-center">
            <p className="text-xs">
              Current driving conditions are <span className={`font-medium ${
                environmentalImpact.fuelEfficiencyImpact === 'Good' ? 'text-green-500' : 
                environmentalImpact.fuelEfficiencyImpact === 'Moderate' ? 'text-yellow-500' : 'text-orange-500'
              }`}>{environmentalImpact.fuelEfficiencyImpact}</span> for fuel efficiency
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherDisplay;
