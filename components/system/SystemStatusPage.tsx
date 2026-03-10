"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SystemStatusPageProps {
  code: number;
  title: string;
  description: string;
  buttonText?: string;
  href?: string;
}

export function SystemStatusPage({
  code,
  title,
  description,
  buttonText,
  href,
}: SystemStatusPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-6 max-w-lg">
        <div className="text-6xl font-bold tracking-tight">
          {code}
        </div>

        <h1 className="text-2xl font-semibold">
          {title}
        </h1>

        <p className="text-muted-foreground text-sm">
          {description}
        </p>

        {buttonText && href && (
          <Link href={href}>
            <Button className="mt-4">
              {buttonText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}