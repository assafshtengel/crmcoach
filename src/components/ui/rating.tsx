
import React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  onValueChange: (value: number) => void;
  max?: number;
  className?: string;
}

export function RatingControl({
  value = 0,
  onValueChange,
  max = 5,
  className,
}: RatingProps) {
  return (
    <div className={cn("flex space-x-1 rtl:space-x-reverse", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= value;
        
        return (
          <button
            key={i}
            type="button"
            onClick={() => onValueChange(starValue)}
            className={cn(
              "focus:outline-none transition-colors",
              isFilled ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"
            )}
            aria-label={`Rate ${starValue} out of ${max}`}
          >
            <Star
              className="h-6 w-6 fill-current"
              strokeWidth={1}
            />
          </button>
        );
      })}
    </div>
  );
}
