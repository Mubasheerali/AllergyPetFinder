import { useState, useEffect } from "react";
import { Locate, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AllergyFilterChip } from "./AllergyFilterChip";
import { type SearchFilters } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface SearchAndFilterProps {
  onSearch: (filters: SearchFilters) => void;
  onUseMyLocation: () => void;
}

const ALLERGY_FILTERS = [
  "Peanut-Free",
  "Gluten-Free",
  "Dairy-Free",
  "Low Pet Dander"
];

export function SearchAndFilter({ onSearch, onUseMyLocation }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Peanut-Free"]);
  const { toast } = useToast();
  
  // Debounce search to avoid too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch({
        query: searchQuery,
        allergyFilters: selectedFilters
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedFilters, onSearch]);
  
  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };
  
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      onUseMyLocation();
    } else {
      toast({
        variant: "destructive",
        title: "Location Error",
        description: "Geolocation is not supported by your browser."
      });
    }
  };
  
  return (
    <div className="mb-6">
      {/* Search bar */}
      <div className="bg-white rounded-lg shadow-sm flex items-center p-2 mb-4 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/50">
        <Search className="text-gray-500 mx-2" />
        <input
          type="text"
          placeholder="Find pet-friendly places nearby..."
          className="flex-grow px-2 py-2 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button 
          className="flex items-center gap-1"
          onClick={handleUseMyLocation}
        >
          <Locate className="h-4 w-4" />
          <span>Near Me</span>
        </Button>
      </div>
      
      {/* Filter options */}
      <div className="flex flex-col md:flex-row md:items-center mb-2">
        <h2 className="font-semibold text-lg mb-3 md:mb-0 md:mr-4">Allergy Safe Filters:</h2>
        
        <div className="flex flex-wrap gap-2">
          {ALLERGY_FILTERS.map((filter) => (
            <AllergyFilterChip
              key={filter}
              label={filter}
              checked={selectedFilters.includes(filter)}
              onChange={() => handleFilterToggle(filter)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
