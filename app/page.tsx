import Hero from "@/components/sections/hero";
import Works from "@/components/sections/works";
import StudioNote from "@/components/sections/studio-note";
import ServicesList from "@/components/sections/services-list";
import Growth from "@/components/sections/growth";
import Clients from "@/components/sections/clients";

/**
 * Home: the spiral, the work, the studio, then the argument (services,
 * numbers, passengers) and the footer carries the call to action.
 */
export default function HomePage() {
  return (
    <main>
      <Hero />
      <Works />
      <StudioNote />
      <ServicesList />
      <Growth />
      <Clients />
    </main>
  );
}
