import type { TFilterItem } from "@/App";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { capitalize } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MultiSelect } from "./ui/multiselect";
export type BaseCondition = "is" | "is_not";
export type TextCondition = BaseCondition | "contains" | "does_not_contain";
export type SelectCondition = BaseCondition | "is_any_of";
export type DateCondition =
  | BaseCondition
  | "is_after"
  | "is_before"
  | "is_on_or_after"
  | "is_on_or_before"
  | "is_between";
export type NumberCondition =
  | "equals_to"
  | "does_not_equal_to"
  | "is_greater_than"
  | "is_less_than"
  | "is_greater_than_or_equal_to"
  | "is_less_than_or_equal_to"
  | "is_between";
export type FieldCondition =
  | TextCondition
  | DateCondition
  | NumberCondition
  | SelectCondition;

export type SelectedFilter = {
  condition: FieldCondition;
  value: string | number | Array<string | number> | null;
};

interface FieldParametersProps {
  field: TFilterItem;
  exclude?: FieldCondition[];
  onApply(selected: SelectedFilter | null): void;
  defaultValue?: SelectedFilter | null;
  renderSaveButton?: (
    handleApply: () => void,
    isValidSelection: boolean
  ) => React.ReactNode;
}

export function FieldParameters({
  field,
  exclude,
  renderSaveButton,
  onApply,
  defaultValue,
}: FieldParametersProps) {
  const [selected, setSelected] = useState<SelectedFilter | null>(
    defaultValue || null
  );

  const conditions = useMemo(() => {
    const _conditions = getFieldConditions(field.type);
    if (!exclude || exclude?.length < 1)
      return _conditions.filter((c) => !exclude?.includes(c));
    else return _conditions;
  }, [field.type, exclude]);

  function handleConditionChange(condition: FieldCondition) {
    setSelected((prev) => {
      // Reset value when condition changes, use array for is_between
      const newValue = prev?.value
        ? condition === "is_between"
          ? []
          : prev.value
        : null;

      return prev
        ? { ...prev, condition, value: newValue }
        : { condition, value: newValue };
    });
  }

  function handleValueChange(value: string | number | Array<string | number>) {
    setSelected((prev) => (prev ? { ...prev, value } : prev));
  }

  function handleApply() {
    onApply(selected);
  }

  // Check if selected filter is valid for apply button
  const isValidSelection = useMemo(() => {
    if (!selected?.value) return false;

    if (selected.condition === "is_between") {
      const rangeValue = selected.value as Array<string | number>;
      return (
        rangeValue.length === 2 &&
        rangeValue[0] !== null &&
        rangeValue[1] !== null
      );
    }

    if (selected.condition === "is_any_of") {
      const arrayValue = selected.value as Array<string | number>;
      return Array.isArray(arrayValue) && arrayValue.length > 0;
    }

    return true;
  }, [selected]);

  return (
    <div className="min-w-[180px] p-2  md:max-w-[345px]">
      <Label className="inline-block mb-4">{field.label}</Label>

      <RadioGroup
        value={selected?.condition || ""}
        onValueChange={handleConditionChange}
        className="mb-4 space-y-2"
      >
        {conditions.map((condition, idx) => (
          <div
            key={idx}
            className="grid w-full max-w-[200px] md:max-w-sm items-center gap-1.5"
          >
            <div key={condition} className="flex items-center space-x-2">
              <RadioGroupItem value={condition} id={condition} />
              <label htmlFor={condition} className="text-sm text-foreground/80">
                {capitalize(condition.replace(/_/g, " "))}
              </label>
            </div>

            {condition === selected?.condition && (
              <FieldInput
                type={field.type}
                condition={condition}
                selected={selected}
                onValueChange={handleValueChange}
                field={field}
              />
            )}
          </div>
        ))}
      </RadioGroup>

      <div className="flex bg-transparent! justify-end px-0">
        {renderSaveButton ? (
          renderSaveButton(handleApply, isValidSelection)
        ) : (
          <Button
            className="rounded-sm"
            type="button"
            onClick={handleApply}
            size="sm"
            disabled={!isValidSelection}
          >
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}

interface FieldInputProps {
  type: TFilterItem["type"];
  condition: FieldCondition;
  selected: SelectedFilter;
  field: TFilterItem;
  onValueChange(value: string | number | Array<string | number>): void;
}

function FieldInput({
  type,
  condition,
  selected,
  field,
  onValueChange,
}: FieldInputProps) {
  const handleBetweenChange = (index: 0 | 1, value: string | number) => {
    const currentArray = (selected.value as Array<string | number>) || [
      null,
      null,
    ];
    const newArray = [...currentArray];
    newArray[index] = value;
    onValueChange(newArray);
  };

  switch (type) {
    case "text":
      return (
        <Input
          type="text"
          placeholder="value"
          value={(selected?.value as string) || ""}
          onChange={(e) => onValueChange(e.target.value)}
          className="placeholder:text-muted-foreground"
        />
      );

    case "date":
      if (condition === "is_between") {
        const rangeValue = (selected?.value as Array<string>) || [null, null];
        return (
          <div className="flex items-center gap-2 w-full">
            <Input
              type="date"
              placeholder="from"
              value={rangeValue[0] || ""}
              onChange={(e) => handleBetweenChange(0, e.target.value)}
              className="placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground">and</span>
            <Input
              type="date"
              placeholder="to"
              value={rangeValue[1] || ""}
              onChange={(e) => handleBetweenChange(1, e.target.value)}
              className="placeholder:text-muted-foreground"
            />
          </div>
        );
      }
      return (
        <Input
          type="date"
          placeholder="value"
          value={(selected?.value as string) || ""}
          onChange={(e) => onValueChange(e.target.value)}
          className="placeholder:text-muted-foreground"
        />
      );

    case "number":
      if (condition === "is_between") {
        const rangeValue = (selected?.value as Array<number>) || [null, null];
        return (
          <div className="gap-1 flex flex-col md:flex-row items-center w-full">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={rangeValue[0] || ""}
              onChange={(e) => handleBetweenChange(0, Number(e.target.value))}
              className="placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground block text-center pb-0.5">
              and
            </span>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={rangeValue[1] || ""}
              onChange={(e) => handleBetweenChange(1, Number(e.target.value))}
              className="placeholder:text-muted-foreground "
            />
          </div>
        );
      }
      return (
        <Input
          type="number"
          placeholder="value"
          value={(selected?.value as number) || ""}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="placeholder:text-muted-foreground"
        />
      );

    case "select":
      if (condition === "is_any_of") {
        // Multi-select for "is_any_of"
        const selectedOptions =
          (selected?.value as Array<string | number>) || [];

        return (
          <MultiSelect
            className="px-1"
            value={
              selectedOptions && Array.isArray(selectedOptions)
                ? selectedOptions?.map((option) => ({
                    value: capitalize(String(option || "")),
                    label: option as string,
                  }))
                : []
            }
            options={field.options?.map((option) => ({
              value: capitalize(String(option || "")),
              label: option as string,
            }))}
            onChange={(selected) => {
              onValueChange(selected.map((option) => option.value));
            }}
            hideClearAllButton
          />
        );
      }

      // Single select for "is" and "is_not"
      return (
        <Select value={selected?.value as string} onValueChange={onValueChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {field.options?.map((option, idx) => (
                <SelectItem
                  key={idx}
                  value={option as string}
                  className="font-normal"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );

    default:
      return null;
  }
}

function getFieldConditions(fieldType: TFilterItem["type"]): FieldCondition[] {
  switch (fieldType) {
    case "text":
      return ["is", "is_not", "contains", "does_not_contain"];
    case "date":
      return [
        "is",
        "is_not",
        "is_after",
        "is_before",
        "is_on_or_after",
        "is_on_or_before",
        "is_between",
      ];
    case "number":
      return [
        "equals_to",
        "does_not_equal_to",
        "is_greater_than",
        "is_less_than",
        "is_greater_than_or_equal_to",
        "is_less_than_or_equal_to",
        "is_between",
      ];
    case "select":
      return ["is", "is_not", "is_any_of"];
    default:
      return ["is", "is_not", "contains", "does_not_contain"];
  }
}
