// Edit this file to fill in your own details.
export const site = {
  name: "Jyothiss Jayadevan",
  role: "AI Engineer & Full Stack Developer",
  tagline: "I build interactive experiences for the web.",
  about:
    "Write a short paragraph about yourself, what you work on, and what you are looking for.",
  // About section: hover (or tap) a topic on the left to reveal its card on the right.
  // Each topic shows three tilted photos (first one is the largest).
  // Images live in public/images/about/ (Unsplash placeholders; swap in your own).
  aboutTopics: [
    {
      title: "Who I Am",
      images: ["/images/about/who.webp", "/images/about/who-2.webp", "/images/about/who-3.webp"],
      heading: "Engineer who likes building things people can touch.",
      body: "I'm an AI engineer and full stack developer. I enjoy turning ideas into products end to end, from the model and the API to the interface and the little details that make it feel alive.",
      tags: ["AI Engineer", "Full Stack", "Your city"],
    },
    {
      title: "Experience",
      images: ["/images/about/experience.webp", "/images/about/experience-2.webp", "/images/about/experience-3.webp"],
      heading: "Shipping AI and web products.",
      body: "I've built full stack apps with React, Next.js and Node, and LLM-powered tools with Python, PyTorch, LangChain and the OpenAI and Claude APIs. Replace this with your roles, companies and highlights.",
      tags: ["Role @ Company", "20XX - Present", "Key win"],
    },
    {
      title: "What I Do",
      images: ["/images/about/work.webp", "/images/about/work-2.webp", "/images/about/work-3.webp"],
      heading: "AI systems, web apps, 3D on the web.",
      body: "Agents and RAG pipelines, production web apps, and interactive 3D experiences with Three.js and React Three Fiber.",
      tags: ["LLM Agents", "RAG", "Next.js", "Three.js"],
    },
    {
      title: "Hobbies",
      images: ["/images/about/hobbies.webp", "/images/about/hobbies-2.webp", "/images/about/hobbies-3.webp"],
      heading: "Outside of the editor.",
      body: "Replace this with what you do for fun: games, sports, music, photography, reading, travel, side projects...",
      tags: ["Gaming", "Side projects", "Music"],
    },
    {
      title: "Looking For",
      images: ["/images/about/next.webp", "/images/about/next-2.webp", "/images/about/next-3.webp"],
      heading: "Let's build something together.",
      body: "Open to roles and collaborations in AI engineering and full stack development. Replace this with what you're looking for next.",
      tags: ["Full-time roles", "Freelance", "Collabs"],
    },
  ],
  email: "you@example.com",
  links: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
  ],
  // Opening 3D sequence. Each phrase is written down one wall of the shaft
  // under the window that the camera falls through (exactly four).
  intro: {
    words: ["AI ENGINEER", "FULL STACK DEVELOPER", "BUILDER. LEARNER.", "3D ON THE WEB"],
  },
  // Logo cards that travel along the path marquee in the Tech Stack section.
  techStack: [
    { name: "React", src: "/images/tech/react.webp" },
    { name: "Next.js", src: "/images/tech/next.webp" },
    { name: "Node.js", src: "/images/tech/node.webp" },
    { name: "Express", src: "/images/tech/express.webp" },
    { name: "MongoDB", src: "/images/tech/mongo.webp" },
    { name: "MySQL", src: "/images/tech/mysql.webp" },
    { name: "TypeScript", src: "/images/tech/typescript.webp" },
    { name: "JavaScript", src: "/images/tech/javascript.webp" },
    { name: "Python", src: "/images/tech/python.webp" },
    { name: "PyTorch", src: "/images/tech/pytorch.webp" },
    { name: "Hugging Face", src: "/images/tech/huggingface.webp" },
    { name: "LangChain", src: "/images/tech/langchain.webp" },
    { name: "OpenAI", src: "/images/tech/openai.webp" },
    { name: "Claude", src: "/images/tech/claude.webp" },
  ],
  // Zoom parallax at the top of Projects. Slot 0 is the center image that zooms
  // to full screen; slots 1-6 are the surrounding tiles.
  showcase: [
    { src: "/images/showcase/1.webp", alt: "Featured project screenshot" },
    { src: "/images/showcase/2.webp", alt: "Project screenshot" },
    { src: "/images/showcase/3.webp", alt: "Project screenshot" },
    { src: "/images/showcase/4.webp", alt: "Project screenshot" },
    { src: "/images/showcase/5.webp", alt: "Project screenshot" },
    { src: "/images/showcase/6.webp", alt: "Project screenshot" },
    { src: "/images/showcase/2.webp", alt: "Project screenshot" },
  ],
  footer: {
    // Word rendered in 3D with the video playing inside it (see components/footer).
    giantText: "JYOTHISS",
  },
};
