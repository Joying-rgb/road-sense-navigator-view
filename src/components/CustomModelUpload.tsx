
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CustomModelConfig {
  modelUrl: string | null;
  labelsUrl: string | null;
  isLoaded: boolean;
  name: string;
}

export interface HSVFilterParams {
  hueMin: number;
  hueMax: number;
  satMin: number;
  satMax: number;
  valMin: number;
  valMax: number;
}

interface CustomModelUploadProps {
  onModelLoaded: (config: CustomModelConfig) => void;
  onFilterParamsChange: (params: HSVFilterParams) => void;
}

const CustomModelUpload: React.FC<CustomModelUploadProps> = ({ 
  onModelLoaded,
  onFilterParamsChange 
}) => {
  const [modelName, setModelName] = useState("");
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [labelsFile, setLabelsFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // HSV filter parameters
  const [filterParams, setFilterParams] = useState<HSVFilterParams>({
    hueMin: 0,
    hueMax: 180,
    satMin: 0,
    satMax: 255,
    valMin: 0,
    valMax: 255
  });

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.json')) {
        setModelFile(file);
      } else {
        toast.error("Please upload a valid model.json file");
      }
    }
  };

  const handleLabelsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.json')) {
        setLabelsFile(file);
      } else {
        toast.error("Please upload a valid labels.json file");
      }
    }
  };
  
  const handleFilterParamChange = (
    param: keyof HSVFilterParams, 
    value: number
  ) => {
    const newParams = { ...filterParams, [param]: value };
    setFilterParams(newParams);
    onFilterParamsChange(newParams);
  };

  const handleUpload = async () => {
    if (!modelFile || !labelsFile || !modelName) {
      toast.error("Please provide a model name, model file, and labels file");
      return;
    }

    setIsLoading(true);
    
    try {
      // Create object URLs for the uploaded files
      const modelUrl = URL.createObjectURL(modelFile);
      const labelsUrl = URL.createObjectURL(labelsFile);
      
      // Notify parent component
      onModelLoaded({
        modelUrl,
        labelsUrl,
        isLoaded: true,
        name: modelName
      });
      
      toast.success(`Custom model "${modelName}" loaded successfully`);
    } catch (error) {
      console.error("Error loading custom model:", error);
      toast.error("Failed to load custom model");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Custom Traffic Sign Detection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Model name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="mb-2"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Model File (model.json)</label>
                <label className={cn(
                  "flex items-center justify-center border-2 border-dashed border-input rounded-md p-4 cursor-pointer",
                  modelFile ? "bg-muted/50" : ""
                )}>
                  <Input 
                    type="file" 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleModelFileChange}
                  />
                  <div className="flex flex-col items-center text-sm">
                    <Upload className="h-4 w-4 mb-1 text-muted-foreground" />
                    {modelFile ? modelFile.name : "Upload model.json"}
                  </div>
                </label>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Labels File (labels.json)</label>
                <label className={cn(
                  "flex items-center justify-center border-2 border-dashed border-input rounded-md p-4 cursor-pointer",
                  labelsFile ? "bg-muted/50" : ""
                )}>
                  <Input 
                    type="file" 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleLabelsFileChange}
                  />
                  <div className="flex flex-col items-center text-sm">
                    <Upload className="h-4 w-4 mb-1 text-muted-foreground" />
                    {labelsFile ? labelsFile.name : "Upload labels.json"}
                  </div>
                </label>
              </div>
            </div>
            
            <Button 
              onClick={handleUpload} 
              disabled={!modelFile || !labelsFile || !modelName || isLoading}
              className="w-full"
            >
              {isLoading ? "Loading..." : "Load Custom Model"}
            </Button>
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center mb-2">
              <Filter className="h-4 w-4 mr-1" />
              <h3 className="text-sm font-medium">HSV Color Filtering</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Hue Range (0-180)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs mb-1 block">Min</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="180" 
                      value={filterParams.hueMin}
                      onChange={(e) => handleFilterParamChange('hueMin', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block">Max</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="180" 
                      value={filterParams.hueMax}
                      onChange={(e) => handleFilterParamChange('hueMax', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Saturation Range (0-255)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs mb-1 block">Min</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="255" 
                      value={filterParams.satMin}
                      onChange={(e) => handleFilterParamChange('satMin', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block">Max</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="255" 
                      value={filterParams.satMax}
                      onChange={(e) => handleFilterParamChange('satMax', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Value Range (0-255)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs mb-1 block">Min</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="255" 
                      value={filterParams.valMin}
                      onChange={(e) => handleFilterParamChange('valMin', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block">Max</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="255" 
                      value={filterParams.valMax}
                      onChange={(e) => handleFilterParamChange('valMax', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomModelUpload;
