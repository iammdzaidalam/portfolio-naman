import Hero from "@/components/sections/hero";
import Works from "@/components/sections/works";
import StudioNote from "@/components/sections/studio-note";
import ServicesList from "@/components/sections/services-list";
import Growth from "@/components/sections/growth";
import Clients from "@/components/sections/clients";

/**
 * Home: the spiral, then what we do, the work it made, the studio, the
 * numbers and the brands they were made for; the footer carries the call to
 * action.
 *
 * The clients section runs brief here. In full it is two complete case studies
 * with their own reel strips, which is a page of its own and is one: /studio.
 */
export default function HomePage() {
  return (
    <main>
      <Hero />
      {/* What we do comes straight after the showreel, before the work it made. */}
      <ServicesList />
      <Works />
      <StudioNote />
      <Growth />
      <Clients variant="brief" />
    </main>
  );
}
