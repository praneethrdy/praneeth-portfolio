import Contact from "@/components/contact/Contact";
import Footer from "@/components/contact/Footer";
import Education from "@/components/education/Education";
import Experience from "@/components/experience/Experience";
import Hero from "@/components/hero/Hero";
import Nav from "@/components/nav/Nav";
import Projects from "@/components/projects/Projects";
import Skills from "@/components/skills/Skills";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
