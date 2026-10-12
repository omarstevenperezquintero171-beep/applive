// src/app/studio/[tool]/page.tsx
import { notFound } from 'next/navigation';
import { STUDIO_TOOLS, StudioToolConfig } from '@/lib/studioTools';
import StudioToolView from './StudioToolView';

export function generateStaticParams() {
  return Object.keys(STUDIO_TOOLS).map((tool) => ({
    tool,
  }));
}

export default async function StudioToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const resolvedParams = await params;
  const toolConfig: StudioToolConfig | undefined = STUDIO_TOOLS[resolvedParams.tool];

  if (!toolConfig) {
    notFound();
  }

  return <StudioToolView config={toolConfig} />;
}
