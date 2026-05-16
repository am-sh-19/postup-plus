"use client";

import type { ContractCitation } from "@/lib/ai-contract";

interface SourceListProps {
  citations: ContractCitation[];
  label?: string;
  compact?: boolean;
}

const DOMAIN_BADGE: Record<string, string> = {
  "pubmed.ncbi.nlm.nih.gov": "PubMed",
  "ncbi.nlm.nih.gov": "NCBI",
  "pmc.ncbi.nlm.nih.gov": "PMC",
  "nih.gov": "NIH",
  "cdc.gov": "CDC",
  "mayoclinic.org": "Mayo Clinic",
  "uptodate.com": "UpToDate",
  "medscape.com": "Medscape",
  "aafp.org": "AAFP",
  "who.int": "WHO",
  "cochranelibrary.com": "Cochrane",
  "nejm.org": "NEJM",
  "jamanetwork.com": "JAMA",
  "bmj.com": "BMJ",
  "thelancet.com": "Lancet",
  "acpjournals.org": "ACP",
  "aaos.org": "AAOS",
};

function sourceName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return DOMAIN_BADGE[host] ?? host.split(".")[0]!.toUpperCase();
  } catch {
    return "Source";
  }
}

function cleanTitle(title: string): string {
  // Strip trailing " - PMC" / " - PubMed" / etc. so the badge isn't doubled.
  return title
    .replace(/\s+[-–—]\s+(PMC|PubMed|NCBI|AAOS|NEJM|JAMA|BMJ|Lancet|Cochrane|Medscape|Mayo Clinic|UpToDate|NIH|CDC|WHO|AAFP|ACP)\s*$/i, "")
    .trim();
}

export function SourceList({
  citations,
  label = "Sources",
  compact = false,
}: SourceListProps) {
  if (citations.length === 0) return null;

  return (
    <section className="mt-4 pt-4 border-t border-sp-line-soft">
      <p className="text-[10px] uppercase tracking-[0.1em] text-sp-subtle font-semibold m-0 mb-2 flex items-center gap-2">
        {label}
        <span className="text-sp-muted normal-case tracking-normal text-[10px]">
          · {citations.length}
        </span>
      </p>
      <ol
        className={`m-0 p-0 list-none ${compact ? "space-y-1" : "space-y-1.5"}`}
      >
        {citations.map((c, i) => {
          const name = sourceName(c.url);
          const title = cleanTitle(c.title);
          return (
            <li
              key={c.url}
              className="group flex items-start gap-2 text-[12.5px] leading-snug"
            >
              <span className="shrink-0 inline-flex items-center justify-center font-mono text-[10px] text-sp-muted bg-sp-canvas border border-sp-line rounded w-5 h-5 mt-px">
                {i + 1}
              </span>
              <span className="shrink-0 text-[10px] uppercase tracking-[0.06em] font-semibold text-sp-teal-800 bg-sp-teal-50 border border-sp-teal-100 rounded px-1.5 py-0.5 mt-px">
                {name}
              </span>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sp-text hover:text-sp-teal-800 group-hover:underline decoration-sp-teal-300 underline-offset-2 truncate"
                title={c.title}
              >
                {title}
              </a>
              <svg
                aria-hidden
                className="shrink-0 w-3 h-3 mt-1 text-sp-subtle group-hover:text-sp-teal-700"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M4 2h6v6M10 2L4 8M8 7v3H2V4h3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
