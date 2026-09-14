"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

import { CONNECT, PHOTOS, SITE } from "@/lib/content";
import BubbleButton from "@/components/effects/bubble-button";

/**
 * The booking form. Underlined fields, mono labels, nothing boxed.
 *
 * Laid out on the page's own two columns: the direct contacts take the marker
 * column under a still, the form takes the headline column.
 *
 * There is no endpoint behind it yet: `onSubmit` only shows the confirmation.
 * Wire it to a route handler or a form service before launch.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  // 16px floor: iOS Safari zooms into any field set smaller than that.
  const field =
    "rule focus:border-accent w-full border-b bg-transparent py-[0.7em] text-[max(16px,1.0625em)] transition-colors duration-300 outline-none";

  const autocomplete: Record<string, string> = {
    name: "name",
    company: "organization",
    phone: "tel",
    email: "email",
  };

  return (
    <div className="grid grid-cols-[42%_1fr] gap-[4vw] max-tablet:grid-cols-1 max-tablet:gap-[3em]">
      {/*
        Only the entries that go somewhere are links. The social profiles have
        no URLs yet and the address is not a destination; announcing those as
        links would promise a navigation that only jumps to the top of the page.
      */}
      <div className="max-tablet:order-last">
        <div className="relative mb-[2em] aspect-[4/3] overflow-hidden">
          <Image
            src={PHOTOS.contact.src}
            alt={PHOTOS.contact.alt}
            fill
            sizes="(max-width: 992px) 100vw, 40vw"
            className="object-cover"
          />
        </div>

        <p className="label mb-[1.5em] opacity-60">Direct</p>
        <div className="rule border-t">
          {/*
            Anything still unconfirmed is dropped rather than guessed. A wrong
            handle sends people to somebody else's account, which is worse than
            an absent row.
          */}
          {[
            { label: SITE.email, href: `mailto:${SITE.email}` },
            ...(SITE.phone ? [{ label: SITE.phone, href: SITE.phoneHref }] : []),
            ...(SITE.instagram ? [{ label: `Instagram · ${SITE.instagram}`, href: null }] : []),
            ...(SITE.linkedin ? [{ label: `LinkedIn · ${SITE.linkedin}`, href: null }] : []),
            { label: SITE.address, href: null },
          ].map((entry) =>
            entry.href ? (
              <a
                key={entry.label}
                href={entry.href}
                className="rule hover:text-accent block border-b py-[0.85em] text-[1.0625em] opacity-80 transition-[opacity,padding,color] duration-300 hover:pl-[0.5em] hover:opacity-100"
              >
                {entry.label}
              </a>
            ) : (
              <span
                key={entry.label}
                className="rule block border-b py-[0.85em] text-[1.0625em] opacity-60"
              >
                {entry.label}
              </span>
            ),
          )}
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-x-[1.5em] max-mobile:grid-cols-1">
          {CONNECT.fields.map((entry) => (
            <div
              key={entry.name}
              // The one field with room to write takes the whole row.
              className={`mb-[1.5em] ${entry.name === "need" ? "col-span-2 max-mobile:col-span-1" : ""}`}
            >
              <label htmlFor={entry.name} className="label mb-[0.4em] block opacity-60">
                {entry.label}
                {entry.required ? <span className="text-accent"> *</span> : null}
              </label>
              <input
                id={entry.name}
                name={entry.name}
                type={entry.type}
                required={entry.required}
                placeholder={"placeholder" in entry ? entry.placeholder : undefined}
                autoComplete={autocomplete[entry.name] ?? "off"}
                className={field}
              />
            </div>
          ))}
        </div>

        <div className="mb-[2em]">
          <label htmlFor="message" className="label mb-[0.4em] block opacity-60">
            {CONNECT.messageLabel}
          </label>
          <textarea id="message" name="message" rows={3} className={`${field} resize-none`} />
        </div>

        {/* The bubble draws its own arrow, so the label drops the one in the copy. */}
        <BubbleButton type="submit">{CONNECT.submit.replace(" →", "")}</BubbleButton>

        {/* One live region, present from first render, so the confirmation is announced. */}
        <div role="status" aria-live="polite" className="mt-[1.5em] min-h-[1.5em]">
          {sent ? (
            <>
              <p className="statement text-[1.25em]">{CONNECT.confirmed}</p>
              <p className="label mt-[0.5em] opacity-60">{CONNECT.confirmedSub}</p>
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}
