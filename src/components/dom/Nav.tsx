import { site } from "@/content/site";

const items = ["about", "projects", "contact"];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 backdrop-blur-sm md:px-16">
      <a href="#home" className="font-semibold tracking-tight">
        {site.name}
      </a>
      <nav className="flex gap-6 text-sm text-white/70">
        {items.map((id) => (
          <a key={id} href={`#${id}`} className="capitalize transition hover:text-white">
            {id}
          </a>
        ))}
      </nav>
    </header>
  );
}
