import { useEffect, useRef } from "react";

import {
  BOOK_CTA_EVENT_NAMES,
  BOOK_CTA_EVENT_VERSION,
} from "../../../contracts/book-cta";
import { emitBookCtaEvent } from "../../lib/analytics.client";

type BookCtaProps = {
  href: string;
  destinationHost: string;
};

export function BookCta({ href, destinationHost }: BookCtaProps) {
  const impressionSent = useRef(false);

  useEffect(() => {
    if (impressionSent.current) {
      return;
    }

    impressionSent.current = true;
    emitBookCtaEvent({
      event: BOOK_CTA_EVENT_NAMES.impression,
      version: BOOK_CTA_EVENT_VERSION,
      surface: "book",
      destination_host: destinationHost,
    });
  }, [destinationHost]);

  return (
    <a
      className="button button-primary"
      href={href}
      rel="noopener noreferrer"
      onClick={() => {
        emitBookCtaEvent({
          event: BOOK_CTA_EVENT_NAMES.click,
          version: BOOK_CTA_EVENT_VERSION,
          surface: "book",
          destination_host: destinationHost,
        });
      }}
    >
      Buy the book
    </a>
  );
}
