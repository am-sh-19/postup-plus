"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContractCitation } from "@/lib/ai-contract";

interface CitedMarkdownProps {
  text: string;
  citations: ContractCitation[];
}

// Replace [N] tokens with real markdown links pointing at the matching
// citation. The link title carries the source title so the `a` override
// can render a polished superscript chip.
function attachCitationLinks(
  text: string,
  citations: ContractCitation[],
): string {
  return text.replace(/\[(\d+)\]/g, (match, raw: string) => {
    const idx = parseInt(raw, 10) - 1;
    const cite = citations[idx];
    if (!cite) return match;
    const safeTitle = cite.title.replace(/"/g, "'");
    return `[${raw}](${cite.url} "${safeTitle}")`;
  });
}

function isCitationChild(children: React.ReactNode): string | null {
  if (typeof children === "string" && /^\d+$/.test(children)) return children;
  if (Array.isArray(children) && children.length === 1) {
    const only = children[0];
    if (typeof only === "string" && /^\d+$/.test(only)) return only;
  }
  return null;
}

export function CitedMarkdown({ text, citations }: CitedMarkdownProps) {
  const processed = attachCitationLinks(text, citations);

  return (
    <div className="cited-md text-[13.5px] text-sp-text leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="m-0 mb-3 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-sp-ink">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-sp-text">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="m-0 mb-3 pl-4 list-disc marker:text-sp-subtle space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="m-0 mb-3 pl-4 list-decimal marker:text-sp-subtle space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="m-0 [&>p]:m-0 [&>p]:inline">{children}</li>
          ),
          h1: ({ children }) => (
            <h3 className="text-[15px] font-semibold text-sp-ink mt-4 mb-2 tracking-tight">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="text-[14px] font-semibold text-sp-ink mt-4 mb-2 tracking-tight">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-[13px] font-semibold text-sp-ink mt-3 mb-1.5 uppercase tracking-[0.06em]">
              {children}
            </h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-sp-teal-300 pl-3 my-3 text-sp-muted italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-sp-line-soft" />,
          code: ({ children }) => (
            <code className="font-mono text-[12px] bg-sp-canvas border border-sp-line rounded px-1 py-0.5">
              {children}
            </code>
          ),
          a: ({ href, title, children }) => {
            const citationNum = isCitationChild(children);
            if (citationNum && href) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title ?? undefined}
                  className="inline-flex align-super text-[10px] font-semibold text-sp-teal-700 hover:text-sp-teal-900 hover:bg-sp-teal-50 rounded px-1 py-px ml-0.5 transition"
                >
                  [{citationNum}]
                </a>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sp-teal-700 underline-offset-2 hover:underline"
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="text-[12px] border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="text-left px-2 py-1 border-b border-sp-line font-semibold text-sp-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1 border-b border-sp-line-soft align-top">
              {children}
            </td>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
