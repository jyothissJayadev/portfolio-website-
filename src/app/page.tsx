import SceneCanvas from "@/components/canvas/SceneCanvas";
import Nav from "@/components/dom/Nav";
import AboutSlider from "@/components/dom/AboutSlider";
import TechStack from "@/components/dom/TechStack";
import DreiFooter from "@/components/footer/DreiFooter";
import GallerySection from "@/components/gallery/GallerySection";
import IntroSection from "@/components/intro/IntroSection";

export default function Home() {
  return (
    <>
      <SceneCanvas />
      <Nav />
      <main>
        <IntroSection />

        <GallerySection />

        <AboutSlider />

        <TechStack />
      </main>
      <DreiFooter />
    </>
  );
}
