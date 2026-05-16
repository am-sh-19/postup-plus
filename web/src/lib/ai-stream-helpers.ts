import type { ContractCitation, ContractEvent } from "./ai-contract";

export interface StreamLikePart {
  type: string;
  // Loose shape — we just dig out the fields we need by name without
  // committing to the exact AI SDK generic. v6 puts text-delta chunks
  // in `text`, but tool-input-delta chunks in `delta`.
  text?: string;
  delta?: string;
  query?: string;
  url?: string;
  title?: string;
  sourceType?: string;
  partialJson?: string;
  input?: { query?: string };
  toolName?: string;
  errorText?: string;
  error?: unknown;
}

export class ContractStreamWriter {
  private readonly encoder = new TextEncoder();
  private readonly seen = new Set<string>();
  private readonly citations: ContractCitation[] = [];
  private partialToolInput = "";
  private lastSearchQuery = "";

  constructor(private readonly controller: ReadableStreamDefaultController) {}

  send(event: ContractEvent): void {
    this.controller.enqueue(
      this.encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
    );
  }

  /** Consume one AI SDK stream part and emit matching contract events. */
  handle(part: StreamLikePart): void {
    if (!part || typeof part !== "object" || !("type" in part)) return;

    switch (part.type) {
      case "text-delta": {
        // v6: chunk lives in `text`, not `delta`.
        const chunk =
          typeof part.text === "string" && part.text.length > 0
            ? part.text
            : typeof part.delta === "string"
              ? part.delta
              : "";
        if (chunk) {
          this.send({ type: "text_delta", text: chunk });
        }
        return;
      }

      case "tool-input-start": {
        this.partialToolInput = "";
        this.send({ type: "searching", query: "" });
        return;
      }

      case "tool-input-delta": {
        if (typeof part.delta === "string") {
          this.partialToolInput += part.delta;
          try {
            const parsed = JSON.parse(this.partialToolInput) as {
              query?: string;
            };
            if (parsed.query && parsed.query !== this.lastSearchQuery) {
              this.lastSearchQuery = parsed.query;
              this.send({ type: "searching", query: parsed.query });
            }
          } catch {
            // partial JSON — keep accumulating
          }
        }
        return;
      }

      case "tool-call": {
        this.partialToolInput = "";
        const q = part.input?.query;
        if (q && q !== this.lastSearchQuery) {
          this.lastSearchQuery = q;
          this.send({ type: "searching", query: q });
        }
        return;
      }

      case "source": {
        if (part.sourceType === "url" && part.url && !this.seen.has(part.url)) {
          this.seen.add(part.url);
          this.citations.push({
            title: part.title ?? "Source",
            url: part.url,
          });
        }
        return;
      }

      case "error": {
        const msg =
          typeof part.errorText === "string"
            ? part.errorText
            : part.error instanceof Error
              ? part.error.message
              : "Unknown stream error";
        this.send({ type: "error", error: msg });
        return;
      }

      default:
        return;
    }
  }

  finish(): void {
    this.send({ type: "done", citations: this.citations });
  }
}

export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
