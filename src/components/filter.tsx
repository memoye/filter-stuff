import type { TFilterItem } from "../App";
import { FieldParameters, type SelectedFilter } from "./field-parameters";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface FilterProps {
  selectedFilter: TFilterItem[];
  showCount?: boolean;
  filterItems: TFilterItem[];
  setFilterItems?: React.Dispatch<React.SetStateAction<TFilterItem[]>>;
  className?: string;
  align?: "center" | "start" | "end";
}

export function Filter({
  filterItems,
  setFilterItems,
  selectedFilter,
  showCount,
  className,
  align,
}: FilterProps) {
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
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="px-2">
            {showCount && selectedFilter?.length > 0 && (
              <Badge variant="outline">{selectedFilter.length}</Badge>
            )}
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          {filterItems.map((field, idx) => (
            <DropdownMenuSub key={idx}>
              <DropdownMenuSubTrigger>{field.label}</DropdownMenuSubTrigger>

              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  sideOffset={8}
                  className="overflow-visible"
                >
                  <DropdownMenuGroup>
                    <FieldParameters
                      field={field}
                      onApply={(selected) => handleChange(selected, field.id)}
                      defaultValue={field.value as SelectedFilter}
                      renderSaveButton={(handleApply, isValidSelection) => (
                        <DropdownMenuItem asChild>
                          <Button
                            className="rounded-sm"
                            type="button"
                            onClick={handleApply}
                            size="sm"
                            disabled={!isValidSelection}
                          >
                            Apply
                          </Button>
                        </DropdownMenuItem>
                      )}
                    />
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
