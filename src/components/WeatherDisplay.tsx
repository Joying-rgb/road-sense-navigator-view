
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, CloudRain, CloudSnow } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location: string;
}

const WeatherDisplay = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    humidity: 65,
    condition: 'sunny',
    location: 'Current Location'
  });

  // In a real app, we would fetch weather data from an API
  useEffect(() => {
    // Simulate API call with sample data
    const fetchWeather = () => {
      // This would be replaced with actual API call
      setTimeout(() => {
        const conditions: ('sunny' | 'cloudy' | 'rainy' | 'snowy')[] = ['sunny', 'cloudy', 'rainy', 'snowy'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        setWeather({
          temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
          humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
          condition: randomCondition,
          location: 'Current Location'
        });
      }, 2000);
    };
    
    fetchWeather();
    // In real app, we would set up interval to refresh weather data
  }, []);

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
        <CardTitle className="text-lg font-semibold">Weather Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
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
            <p className="text-xs text-muted-foreground mt-2">{weather.location}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherDisplay;
