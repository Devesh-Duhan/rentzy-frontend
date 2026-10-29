import { pageMetadata } from '@/seo';
import ProjectsClient from "./ProjectsClient";

export const metadata = pageMetadata('/projects');

export default function ProjectsPage() {
  return <ProjectsClient />;
}
