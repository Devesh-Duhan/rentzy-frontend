import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

// Request-local, public data only. Nothing is cached across users on the server.
export default function PublicQueryBoundary({ entries, children }) {
  const client = new QueryClient();
  for (const { key, data } of entries) client.setQueryData(key, data);
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}
