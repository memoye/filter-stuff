import type { TFilterItem } from "@/App";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent } from "./ui/dropdown-menu";
import {
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";
import { FieldParameters, type SelectedFilter } from "./field-parameters";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/variants";

interface SelectedFiltersProps {
  selectedFilters: TFilterItem[];
  setFilterItems: React.Dispatch<React.SetStateAction<TFilterItem[]>>;
  onReset: (id?: TFilterItem["id"]) => void;
  className?: string;
}

export function SelectedFilters({
  selectedFilters,
  setFilterItems,
  onReset,
  className,
}: SelectedFiltersProps) {
  function handleChange(
    updatedValue: SelectedFilter | null,
    id: TFilterItem["id"]
  ) {
    if (!setFilterItems || !updatedValue) return;

    setFilterItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, value: updatedValue } : item
      )
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      {selectedFilters.map((filter) => {
        return (
          <div
            className={buttonVariants({
              className: "rounded-full!",
              variant: "secondary",
            })}
            key={filter.id}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex flex-nowrap gap-2 text-sm"
                >
                  <span className="font-light">{filter.label}</span>
                  <span className="text-muted-foreground font-light">
                    {filter.value?.condition?.replace(/_/g, " ")}
                  </span>
                  <span className="text-foreground/80 font-medium">
                    {Array.isArray(filter.value?.value) ? (
                      <>
                        {filter.value?.value.slice(0, 3).join(", ")}{" "}
                        {filter.value?.value.length > 3 &&
                          `+${filter.value?.value.length - 3}`}
                      </>
                    ) : (
                      filter.value?.value
                    )}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={12} className="overflow-visible">
                <FieldParameters
                  field={filter}
                  onApply={(selected) => handleChange(selected, filter.id)}
                  defaultValue={filter.value as SelectedFilter}
                  renderSaveButton={(handleApply, isValidSelection) => (
                    <DropdownMenuItem>
                      <Button
                        type="button"
                        onClick={handleApply}
                        disabled={!isValidSelection}
                      >
                        Save
                      </Button>
                    </DropdownMenuItem>
                  )}
                />
              </DropdownMenuContent>
            </DropdownMenu>
            <button type="button" onClick={() => onReset(filter.id)}>
              <X className="size-4" />
              <span className="sr-only">Reset Item</span>
            </button>
          </div>
        );
      })}

      <Button
        variant="destructive"
        className="rounded-full"
        onClick={() => onReset()}
      >
        Reset All
      </Button>
    </div>
  );
}
