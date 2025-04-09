import { InputHTMLAttributes, forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AllergyFilterChipProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const AllergyFilterChip = forwardRef<HTMLInputElement, AllergyFilterChipProps>(
  ({ className, label, checked, ...props }, ref) => {
    const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <div className={cn("allergy-chip", className)}>
        <input
          type="checkbox"
          id={id}
          ref={ref}
          checked={checked}
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "flex items-center px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-50 cursor-pointer text-sm transition-colors",
            checked
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-800 border-gray-300"
          )}
        >
          {checked && <Check className="h-3 w-3 mr-1" />}
          {label}
        </label>
      </div>
    );
  }
);

AllergyFilterChip.displayName = "AllergyFilterChip";

export { AllergyFilterChip };
