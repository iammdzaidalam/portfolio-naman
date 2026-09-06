import type { Metadata } from "next";

import { CONNECT, SITE } from "@/lib/content";
import SectionHead from "@/components/ui/section-head";
import ContactForm from "@/components/sections/contact-form";

export const metadata: Metadata = {
  title: "Connect",
  description: SITE.description,
};

export default function ContactPage() {
  return (
    <main>
      <section className="text-ink px-[var(--gutter)] pt-[calc(var(--corner)+96px)] pb-[7em]">
        <SectionHead
          marker={CONNECT.sign}
          title={CONNECT.question}
          sub={CONNECT.sub}
          titleAs="h1"
          size="xl"
          className="mb-[4em]"
        />

        <ContactForm />
      </section>
    </main>
  );
}
