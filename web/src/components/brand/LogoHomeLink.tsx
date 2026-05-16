"use client";

import Image from "next/image";
import Link from "next/link";
import { clearSession } from "@/lib/session";

interface LogoHomeLinkProps {
  height?: number;
  className?: string;
}

export function LogoHomeLink({ height = 40, className }: LogoHomeLinkProps) {
  return (
    <Link
      href="/login"
      onClick={() => clearSession()}
      className={`inline-flex shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-postup-blue ${className ?? ""}`}
      aria-label="PostUp+ home — return to sign in"
    >
      <Image
        src="/postup-logo.png"
        alt="PostUp+"
        width={Math.round(height * 3.4)}
        height={height}
        priority
        className="h-auto w-auto"
        style={{ height }}
      />
    </Link>
  );
}
