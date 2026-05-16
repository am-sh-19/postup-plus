"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMarkdownProps {
  content: string;
  variant: "assistant" | "system";
}

export function ChatMarkdown({ content, variant }: ChatMarkdownProps) {
  const rootClass =
    variant === "system" ? "chat-markdown chat-markdown--system" : "chat-markdown";

  return (
    <div className={rootClass}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="chat-markdown__p">{children}</p>,
        ul: ({ children }) => <ul className="chat-markdown__ul">{children}</ul>,
        ol: ({ children }) => <ol className="chat-markdown__ol">{children}</ol>,
        li: ({ children }) => <li className="chat-markdown__li">{children}</li>,
        strong: ({ children }) => (
          <strong className="chat-markdown__strong">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="chat-markdown__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <pre className="chat-markdown__pre">
                <code>{children}</code>
              </pre>
            );
          }
          return <code className="chat-markdown__code">{children}</code>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
