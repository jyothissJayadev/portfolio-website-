import SceneCanvas from "@/components/canvas/SceneCanvas";
import Nav from "@/components/dom/Nav";
import Section from "@/components/dom/Section";
import TechStack from "@/components/dom/TechStack";
import DreiFooter from "@/components/footer/DreiFooter";
import GallerySection from "@/components/gallery/GallerySection";
import { site } from "@/content/site";

export default function Home() {
  return (
    <>
      <SceneCanvas />
      <Nav />
      <main>
        <Section id="home">
          <p className="mb-4 text-violet-300">{site.role}</p>
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">{site.name}</h1>
          <p className="mt-6 text-lg text-white/70 md:text-xl">{site.tagline}</p>
        </Section>

        <Section id="about" title="About">
          <p className="text-lg leading-relaxed text-white/80">{site.about}</p>
        </Section>

        <TechStack />

        <GallerySection />
      </main>
      <DreiFooter />
    </>
  );
}
