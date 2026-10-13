import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { site } from "@/content/site";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return {};
  return { title: `${project.title} · ${site.name}`, description: project.summary };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const [cover, ...screens] = project.images;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-5 md:px-16">
        <Link href="/#projects" className="text-sm text-white/70 transition hover:text-white">
          ← Back to projects
        </Link>
        <Link href="/" className="font-semibold tracking-tight">
          {site.name}
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10 md:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">Project</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">{project.title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-white/70 md:text-xl">{project.summary}</p>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-white/10 py-6 text-sm md:grid-cols-3">
          <div>
            <dt className="text-white/40">Year</dt>
            <dd className="mt-1">{project.year}</dd>
          </div>
          <div>
            <dt className="text-white/40">Role</dt>
            <dd className="mt-1">{project.role}</dd>
          </div>
          <div className="col-span-2 md:col-span-1">
            <dt className="text-white/40">Stack</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-3 py-0.5 text-xs">
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <div className="relative mt-12 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <Image src={cover} alt={`${project.title} cover`} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[2fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed text-white/80">
            {project.description.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {project.links && (
            <div className="flex flex-col gap-3 md:items-start">
              {project.links.live && (
                <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-white/90">
                  Visit live site ↗
                </a>
              )}
              {project.links.repo && (
                <a href={project.links.repo} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold transition hover:border-white/40">
                  View source ↗
                </a>
              )}
            </div>
          )}
        </div>

        {screens.length > 0 && (
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {screens.map((src, i) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <Image src={src} alt={`${project.title} screenshot ${i + 2}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <Link href={`/projects/${next.id}`} className="group mt-24 block border-t border-white/10 pt-10">
          <p className="text-sm text-white/40">Next project</p>
          <p className="mt-2 text-3xl font-bold tracking-tight transition group-hover:text-violet-300 md:text-5xl">
            {next.title} →
          </p>
        </Link>
      </main>
    </div>
  );
}
