"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FiltersSidebar, FilterItem, TopicItem, InstructorItem } from "./FiltersSidebar";
import { CoursesGrid, SortMethod } from "./CoursesGrid";
import { CourseCard } from "./CourseCard";
import { CatalogCourseCard } from "./CatalogCourseCard";
import { Course, PaginationMeta } from "@/types/course";

interface CoursesCatalogProps {
  courses: Course[];
  paginationMeta: PaginationMeta | null;
  categories: FilterItem[];
  topics: TopicItem[];
  instructors: InstructorItem[];
  initialFilters: {
    categories: number[];
    topics: number[];
    instructors: number[];
    sort: SortMethod;
    page: number;
  };
}

export function CoursesCatalog({
  courses,
  paginationMeta,
  categories,
  topics,
  instructors,
  initialFilters,
}: CoursesCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Local state for UI responsiveness
  const [selectedCategories, setSelectedCategories] = useState<number[]>(initialFilters?.categories || []);
  const [selectedTopics, setSelectedTopics] = useState<number[]>(initialFilters?.topics || []);
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>(initialFilters?.instructors || []);
  const [currentSort, setCurrentSort] = useState<SortMethod>(initialFilters?.sort || "newest");
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);

  // Sync state when props change (e.g. on navigation or external update)
  useEffect(() => {
    if (initialFilters) {
      setSelectedCategories(initialFilters.categories);
      setSelectedTopics(initialFilters.topics);
      setSelectedInstructors(initialFilters.instructors);
      setCurrentSort(initialFilters.sort);
      setCurrentPage(initialFilters.page);
    }
  }, [initialFilters]);

  const updateUrl = (updates: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      // Clean up existing parameters for this key
      params.delete(key);
      params.delete(`${key}[]`);
      
      if (Array.isArray(value)) {
        // API expects categories[], topics[], instructors[]
        const paramKey = key.endsWith('[]') ? key : `${key}[]`;
        value.forEach(v => params.append(paramKey, v.toString()));
      } else if (value !== undefined && value !== null) {
        params.set(key, value.toString());
      }
    });

    // Reset to page 1 if filters or sort change, unless page is explicitly updated
    if (!updates.page && (updates.categories !== undefined || updates.topics !== undefined || updates.instructors !== undefined || updates.sort !== undefined)) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handlers
  const toggleCategory = (id: number) => {
    const newCats = selectedCategories.includes(id) 
      ? selectedCategories.filter(x => x !== id) 
      : [...selectedCategories, id];
    
    // Clean up topics that no longer belong to selected categories
    let newTopics = selectedTopics;
    if (newCats.length > 0) {
      const validTopicIds = topics.filter(t => newCats.includes(t.categoryId)).map(t => t.id);
      newTopics = selectedTopics.filter(tId => validTopicIds.includes(tId));
    }
    
    updateUrl({ categories: newCats, topics: newTopics });
  };

  const toggleTopic = (id: number) => {
    const newTopics = selectedTopics.includes(id) 
      ? selectedTopics.filter(x => x !== id) 
      : [...selectedTopics, id];
    updateUrl({ topics: newTopics });
  };

  const toggleInstructor = (id: number) => {
    const newIns = selectedInstructors.includes(id) 
      ? selectedInstructors.filter(x => x !== id) 
      : [...selectedInstructors, id];
    updateUrl({ instructors: newIns });
  };

  const clearAllFilters = () => {
    updateUrl({ categories: [], topics: [], instructors: [], page: 1 });
  };

  const totalCount = paginationMeta?.total || courses.length;
  const totalPages = paginationMeta?.lastPage || 1;

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 w-full">
      <FiltersSidebar
        categories={categories}
        topics={topics}
        instructors={instructors}
        selectedCategories={selectedCategories}
        selectedTopics={selectedTopics}
        selectedInstructors={selectedInstructors}
        onCategoryChange={toggleCategory}
        onTopicChange={toggleTopic}
        onInstructorChange={toggleInstructor}
        onClearAll={clearAllFilters}
        activeCount={selectedCategories.length + selectedTopics.length + selectedInstructors.length}
      />
      
      <CoursesGrid
        totalCount={totalCount}
        showingCount={courses.length}
        currentSort={currentSort}
        onSortChange={(sort) => updateUrl({ sort })}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => updateUrl({ page })}
      >
        {courses.map(course => (
          <CatalogCourseCard
            key={`catalog-course-${course.id}`}
            id={course.id}
            title={course.title}
            lecturer={course.instructor?.name || "Unknown"}
            rating={course.avgRating || 0}
            price={Number(course.basePrice)}
            imageUrl={course.image}
            category={course.category?.name}
            durationWeeks={course.durationWeeks}
          />
        ))}
      </CoursesGrid>
    </div>
  );
}
