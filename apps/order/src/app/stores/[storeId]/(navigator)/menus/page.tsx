"use client";

import useSuspenseWithSession from "@ssurak/api/hooks/useSuspenseWithSession";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { StoreContextResponse } from "@ssurak/api/types/store/store.interface";
import { useState } from "react";
import useObservingCategory from "./hooks/useObservingCategory";
import { Button } from "@ssurak/ui/components/buttons/button";
import CategoryMenuList from "./components/CategoryMenuList";

export default function MenuListPage() {
  const { data: menuCategories } = useSuspenseWithSession<
    StoreContextResponse,
    CategoryWithMenusResponse[]
  >("/stores/v1/sessions/me/store-context", {
    queryOptions: {
      select: (storeContext) => storeContext.table.store.categories,
    },
  });

  ThrowUnavailableMenu(menuCategories.length);

  const [selectedCategory, setSelectedCategory] = useState(
    menuCategories[0].name
  );

  const categoryRefs = useObservingCategory(setSelectedCategory);

  const moveScrollAtCategory = (category: string) => {
    const categoryElement = document.querySelector(
      `[data-category="${CSS.escape(category)}"]`
    );
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <ul className="flex items-center gap-2 px-4 py-2 sticky bg-accent-subtle top-12 z-10">
        {menuCategories.map((category) => (
          <li key={category.name}>
            <Button
              className={`h-9 font-semibold text-sm rounded-3xl`}
              variant={
                selectedCategory === category.name ? "default" : "secondary"
              }
              onClick={() => moveScrollAtCategory(category.name)}
            >
              {category.name}
            </Button>
          </li>
        ))}
      </ul>
      <section>
        <CategoryMenuList categoryRefs={categoryRefs} />
      </section>
    </>
  );
}

function ThrowUnavailableMenu(size: number) {
  if (size === 0) {
    throw new Error("No menu available");
  }
}
