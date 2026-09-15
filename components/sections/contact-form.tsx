"use client";

import { useState, type FormEvent } from "react";

import { CONNECT, DIRECT } from "@/lib/content";
import BubbleButton from "@/components/effects/bubble-button";

/**
 * The booking form. Underlined fields, mono labels, nothing boxed.
 *
 * Laid out on the page's own two columns: the direct contacts take the marker
 * column and hold their place there while the form, in the headline column,
 * scrolls past them.
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
        The contact details, and nothing else in this column.
        
        It held a clip before, which meant the one thing a reader might have
        come here to copy sat below the fold behind a piece of decoration.
        These four rows are the column now.

        Sticky, so they hold their place for the whole length of the form
        rather than scrolling away and leaving a dead half-page beside it. A
        reader who gets three fields in and decides they would rather just
        phone can still see the number. Released below 992px, where the columns
        stack and there is nothing to hold position against.
      */}
      <div className="max-tablet:order-last">
        <div className="sticky top-[calc(var(--nav-height)+2em)] max-tablet:static">
          <p className="label mb-[1.5em] opacity-60">Direct</p>

          <div className="rule border-t">
            {/*
              The same rows as the footer, from the same list. Anything still
              unconfirmed is absent rather than guessed: a wrong handle sends
              people to somebody else's account.
            */}
            {DIRECT.map((entry) => (
              <a
                key={entry.label}
                href={entry.href ?? undefined}
                {...(entry.href?.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : null)}
                className="rule hover:text-accent group flex items-baseline justify-between gap-[1.5em] border-b py-[1em] text-[1.0625em] opacity-80 transition-[opacity,padding,color] duration-300 hover:pl-[0.5em] hover:opacity-100"
              >
                <span>{entry.value}</span>
                <span className="label-xs shrink-0 opacity-50 transition-opacity duration-300 group-hover:opacity-80">
                  {entry.label}
                </span>
              </a>
            ))}
          </div>
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
