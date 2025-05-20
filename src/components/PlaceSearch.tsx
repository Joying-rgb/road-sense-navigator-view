
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlaceSuggestions, PlaceSuggestion } from "@/utils/serpApiUtils";

interface PlaceSearchProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string, suggestion?: PlaceSuggestion) => void;
  className?: string;
  inputClassName?: string;
}

export function PlaceSearch({ placeholder = "Search places...", value = "", onChange, className, inputClassName }: PlaceSearchProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedValueRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update input value if the external value changes
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await getPlaceSuggestions(query);
      setSuggestions(results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Debounce the API calls
    if (debouncedValueRef.current) {
      clearTimeout(debouncedValueRef.current);
    }

    debouncedValueRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setInputValue(suggestion.name);
    onChange(suggestion.name, suggestion);
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onClick={() => setOpen(true)}
              className={cn(inputClassName)}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[calc(100vw-2rem)] sm:w-[400px] lg:w-[500px]" align="start" side="bottom">
          <Command>
            <CommandList>
              {inputValue.length > 0 && (
                <>
                  <CommandEmpty>No places found</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    {suggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion.id}
                        value={suggestion.name}
                        onSelect={() => handleSelectSuggestion(suggestion)}
                        className="flex items-center gap-2 py-3"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{suggestion.name}</span>
                          {suggestion.address && (
                            <span className="text-muted-foreground text-xs line-clamp-1">
                              {suggestion.address}
                            </span>
                          )}
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            value === suggestion.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
