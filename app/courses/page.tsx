import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CoursesCatalog } from "@/components/CoursesCatalog";
import { Course, PaginationMeta } from "@/types/course";

import { apiFetch } from "@/lib/api";

interface ApiCategory {
  id: number;
  name: string;
}

interface ApiTopic {
  id: number;
  name: string;
  category_id?: number;
  categoryId?: number;
  category?: { id: number };
}

interface ApiInstructor {
  id: number;
  name?: string;
  full_name?: string;
  avatar?: string;
}

async function getCategories() {
  try {
    const data = await apiFetch<ApiCategory[]>("/categories", { next: { revalidate: 3600 } });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to fetch categories", e);
    return [];
  }
}

async function getTopics() {
  try {
    const data = await apiFetch<ApiTopic[]>("/topics", { next: { revalidate: 3600 } });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to fetch topics", e);
    return [];
  }
}

async function getInstructors() {
  try {
    const data = await apiFetch<ApiInstructor[]>("/instructors", { next: { revalidate: 3600 } });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to fetch instructors", e);
    return [];
  }
}

async function getCoursesData(params: {
  page?: string;
  categories?: string[];
  topics?: string[];
  instructors?: string[];
  sort?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.sort) query.append('sort', params.sort);

  params.categories?.forEach(id => query.append('categories[]', id));
  params.topics?.forEach(id => query.append('topics[]', id));
  params.instructors?.forEach(id => query.append('instructors[]', id));

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/courses?${query.toString()}`, { next: { revalidate: 0 } });
    const data = await res.json();
    return {
      courses: (data.data as Course[]) || [],
      meta: (data.meta as PaginationMeta) || null
    };
  } catch (e) {
    console.error("Failed to fetch courses data", e);
    return { courses: [], meta: null };
  }
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  // Parse search params
  const page = typeof resolvedParams.page === 'string' ? resolvedParams.page : '1';
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest';

  const categoriesParam = resolvedParams['categories[]'] || resolvedParams.categories;
  const categories = Array.isArray(categoriesParam) ? categoriesParam : (categoriesParam ? [categoriesParam] : []);

  const topicsParam = resolvedParams['topics[]'] || resolvedParams.topics;
  const topics = Array.isArray(topicsParam) ? topicsParam : (topicsParam ? [topicsParam] : []);

  const instructorsParam = resolvedParams['instructors[]'] || resolvedParams.instructors;
  const instructors = Array.isArray(instructorsParam) ? instructorsParam : (instructorsParam ? [instructorsParam] : []);

  // Fetch required data
  const [categoriesData, topicsData, instructorsData, coursesResult] = await Promise.all([
    getCategories(),
    getTopics(),
    getInstructors(),
    getCoursesData({ page, sort, categories, topics, instructors })
  ]);

  // Clean data in case endpoints don't strictly match our expected models
  const cleanCategories = categoriesData.map((c) => ({
    id: c.id,
    name: c.name,
    icon: null,
  }));

  const cleanTopics = topicsData.map((t) => ({
    id: t.id,
    name: t.name,
    categoryId: t.category_id || t.categoryId || (t.category && t.category.id) || 0,
  }));

  const cleanInstructors = instructorsData.map((i) => ({
    id: i.id,
    name: i.name || i.full_name || "Unknown",
    avatar: i.avatar || undefined,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-black font-sans">
      <Header />

      <div className="bg-transparent">
        <div className="max-w-[1566px] mx-auto py-5">
          <div className="flex gap-2 text-sm text-zinc-500 font-medium">
            <a href="/" className="hover:text-indigo-600 transition-colors">Home</a>
            <span className="text-zinc-300 dark:text-zinc-700">›</span>
            <span className="text-zinc-900 dark:text-zinc-100">Browse</span>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1566px] mx-auto py-10 pb-section">
        <CoursesCatalog
          courses={coursesResult.courses}
          paginationMeta={coursesResult.meta}
          categories={cleanCategories}
          topics={cleanTopics}
          instructors={cleanInstructors}
          initialFilters={{
            categories: categories.map(Number),
            topics: topics.map(Number),
            instructors: instructors.map(Number),
            sort: sort as "newest" | "price_asc" | "price_desc" | "popular" | "title_asc",
            page: Number(page)
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
