import { useMemo, useState } from "react";
import { Filter } from "./components/filter";
import { SelectedFilters } from "./components/selected-filters";
import type {
  FieldCondition,
  SelectedFilter,
} from "./components/field-parameters";

export type FieldType = "text" | "select" | "date" | "number";

interface BaseFilter {
  id: number | string;
  label: string;
  value?: SelectedFilter | null;
  excludeParams?: FieldCondition[];
}

interface SelecTFilterItem extends BaseFilter {
  type: "select";
  options: (string | number)[];
}

interface OtherFilter extends BaseFilter {
  type: "text" | "date" | "number";
  options?: never;
}

export type TFilterItem = SelecTFilterItem | OtherFilter;

const initialFilter: TFilterItem[] = [
  {
    id: 1,
    type: "text",
    label: "Name",
  },
  {
    id: 2,
    type: "select",
    label: "Status",
    options: ["Active", "Confused", "Maybe Active", "Not Active"],
  },
  {
    id: 3,
    type: "date",
    label: "Date of Birth",
  },
  {
    id: 8,
    type: "number",
    label: "Age",
    excludeParams: [
      "is_between",
      "is_less_than_or_equal_to",
      "is_greater_than_or_equal_to",
      "is_not",
    ],
  },
  {
    id: 4,
    type: "number",
    label: "Amount",
  },
  {
    id: 5,
    type: "date",
    label: "Created date",
  },
  {
    id: 6,
    type: "select",
    label: "Gender",
    options: ["Male", "Female", "LGTV"],
  },
  {
    id: 7,
    type: "select",
    label: "Fav Emoji",
    options: ["😅", "🤙", "🥥", "🎉"],
  },
];

function App() {
  const [filter, setFilterItems] = useState(initialFilter);

  const selectedFilter = useMemo(
    () => filter?.filter((filter) => filter.value != null, [filter]),
    [filter]
  );

  function handleReset(id?: TFilterItem["id"]) {
    if (!id) {
      setFilterItems(initialFilter);
      return;
    }

    setFilterItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value: null } : item))
    );
  }

  return (
    <main className="container mx-auto min-h-dvh p-5 ">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold mb-5">Filter Example</h1>

        <Filter
          filterItems={filter}
          setFilterItems={setFilterItems}
          selectedFilter={selectedFilter}
          showCount
          className="mb-5"
          align="end"
        />
      </div>

      {selectedFilter.length > 0 && (
        <SelectedFilters
          selectedFilters={selectedFilter}
          setFilterItems={setFilterItems}
          onReset={handleReset}
        />
      )}

      <div className="max-h-[500px] overflow-y-auto bg-muted p-4 mt-64">
        <h2 className="text-lg font-semibold">Initial Filter</h2>
        <pre className="text-xs">
          <code>{JSON.stringify(initialFilter, null, 2)}</code>
        </pre>
      </div>
    </main>
  );
}

export default App;
