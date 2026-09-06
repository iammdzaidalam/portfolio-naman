"use client";

import { TEAM } from "@/lib/content";
import SectionHead from "@/components/ui/section-head";

/**
 * The crew, as an index. Roles at display size, the official titles held back
 * in mono on the right — which is the joke the copy is making anyway.
 */
export default function Team() {
  return (
    <section className="text-ink relative px-[var(--gutter)] py-[7em]">
      <SectionHead
        marker={TEAM.sign}
        title={TEAM.question}
        sub={TEAM.sub}
        className="mb-[4em]"
      />

      <div className="rule border-t">
        {TEAM.members.map((member, index) => (
          <div
            key={member.role}
            className="rule group grid grid-cols-[4em_1fr_auto] items-baseline gap-[1.5em] border-b py-[1.1em] max-mobile:grid-cols-[3em_1fr] max-mobile:gap-y-[0.4em]"
          >
            <span className="label opacity-60">
              ({String(index + 1).padStart(2, "0")})
            </span>
            <span className="display text-[clamp(28px,4vw,60px)]">{member.role}</span>
            {/* Hidden until hover, as the standfirst promises; touch screens get them outright. */}
            <span className="label justify-self-end opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-tablet:opacity-60 max-mobile:col-start-2 max-mobile:justify-self-start">
              {member.real}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
