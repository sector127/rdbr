import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CoursesCatalog } from "@/components/CoursesCatalog";
import { Course, PaginationMeta } from "@/types/course";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.redclass.redberryinternship.ge';

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("Failed to fetch categories", e);
    return [];
  }
}

async function getTopics() {
  try {
    const res = await fetch(`${API_URL}/topics`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("Failed to fetch topics", e);
    return [];
  }
}

async function getInstructors() {
  try {
    const res = await fetch(`${API_URL}/instructors`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.data || [];
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
    const res = await fetch(`${API_URL}/courses?${query.toString()}`, { next: { revalidate: 0 } });
    const data = await res.json();
    return {
      courses: data.data || [],
      meta: data.meta || null
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
  const cleanCategories = categoriesData.map((c: any) => ({
    id: c.id,
    name: c.name,
    icon: null,
  }));

  const cleanTopics = topicsData.map((t: any) => ({
    id: t.id,
    name: t.name,
    categoryId: t.category_id || t.categoryId || (t.category && t.category.id),
  }));

  const cleanInstructors = instructorsData.map((i: any) => ({
    id: i.id,
    name: i.name || i.full_name || "Unknown",
    avatar: i.avatar || null,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-black font-sans">
      <Header />
      
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1566px] mx-auto px-4 lg:px-8 py-5">
          <div className="flex gap-2 text-sm text-zinc-500 font-medium">
            <a href="/" className="hover:text-indigo-600 transition-colors">Home</a>
            <span className="text-zinc-300 dark:text-zinc-700">›</span>
            <span className="text-zinc-900 dark:text-zinc-100">Browse</span>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1566px] mx-auto px-4 lg:px-8 py-10 pb-section">
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
            sort: sort as any,
            page: Number(page)
          }}
        />
      </main>
      
      <Footer />
    </div>
  );
}
