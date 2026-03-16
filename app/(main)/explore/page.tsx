import { redirect } from 'next/navigation';

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    sort?: 'latest' | 'popular' | 'rating';
    page?: string;
    query?: string;
  }>;
}

// Redirect /explore to / with the same query parameters
export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, v as string])
  ).toString();

  redirect(`/${queryString ? `?${queryString}` : ''}`);
}
