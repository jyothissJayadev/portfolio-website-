// Edit this file to fill in your projects. Each project gets a page at
// /projects/<id>, and its images become cards in the 3D gallery.
export type Project = {
  /** URL slug: lowercase letters, numbers and dashes. */
  id: string;
  title: string;
  /** One line shown under the title. */
  summary: string;
  /** Longer write-up; each string is a paragraph. */
  description: string[];
  year: string;
  role: string;
  tags: string[];
  /** First image is the cover; all images appear as gallery cards. */
  images: string[];
  links?: { live?: string; repo?: string };
};

const img = (n: number) => `/images/gallery/${String(n).padStart(2, "0")}.webp`;

const placeholderDescription = [
  "Describe the problem this project solves and who it is for.",
  "Explain what you built, the interesting technical decisions, and what you would do differently next time.",
];

export const projects: Project[] = [
  {
    id: "project-one",
    title: "Project One",
    summary: "What it does and what you built.",
    description: placeholderDescription,
    year: "2026",
    role: "Full-stack developer",
    tags: ["Next.js", "Three.js"],
    images: [img(1), img(2), img(3)],
    links: { live: "https://example.com", repo: "https://github.com/" },
  },
  {
    id: "project-two",
    title: "Project Two",
    summary: "What it does and what you built.",
    description: placeholderDescription,
    year: "2026",
    role: "Frontend developer",
    tags: ["React", "WebGL"],
    images: [img(4), img(5), img(6)],
  },
  {
    id: "project-three",
    title: "Project Three",
    summary: "What it does and what you built.",
    description: placeholderDescription,
    year: "2025",
    role: "Solo project",
    tags: ["TypeScript", "GSAP"],
    images: [img(7), img(8), img(9)],
  },
  {
    id: "project-four",
    title: "Project Four",
    summary: "What it does and what you built.",
    description: placeholderDescription,
    year: "2025",
    role: "Backend developer",
    tags: ["Node.js", "MongoDB"],
    images: [img(10), img(11), img(12)],
  },
  {
    id: "project-five",
    title: "Project Five",
    summary: "What it does and what you built.",
    description: placeholderDescription,
    year: "2024",
    role: "ML engineer",
    tags: ["Python", "PyTorch"],
    images: [img(13), img(14), img(15)],
  },
  {
    id: "project-six",
    title: "Project Six",
    summary: "What it does and what you built.",
    description: placeholderDescription,
    year: "2024",
    role: "AI engineer",
    tags: ["LangChain", "OpenAI"],
    images: [img(16), img(17), img(18)],
  },
];

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

/** One gallery card per project image, each linking to its project page. */
export const galleryCards = projects.flatMap((p) =>
  p.images.map((image) => ({ image, href: `/projects/${p.id}`, title: p.title })),
);
