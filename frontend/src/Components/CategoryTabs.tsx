import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type { CategoryWithVideos } from "../Types/Types";

interface CategoryTabsProps {
  categories: CategoryWithVideos[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <Tabs.Root
      value={activeCategory || categories[0]?.id}
      onValueChange={onCategoryChange}
      className="w-full"
    >
      <Tabs.List className="flex border-b border-gray-200 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((category) => (
          <Tabs.Trigger
            key={category.id}
            value={category.id}
            className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            {category.name} ({category.videos.length})
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {categories.map((category) => (
        <Tabs.Content key={category.id} value={category.id} className="py-4">
          {/* Content will be provided by parent component */}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default CategoryTabs;
