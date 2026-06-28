"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

export function Logo() {
  const { resolvedTheme } = useTheme();
  const mounted = true;

  // Fallback paths during SSR to prevent visual flash
  const iconSrc =
    mounted && resolvedTheme === "light"
      ? "/leetcode-black.png"
      : "/leetcode-gold.png";

  const textSrc =
    mounted && resolvedTheme === "light"
      ? "/leetcode-text-black-fixed.svg"
      : "/leetcode-text-white-fixed.svg";

  return (
    <Link
      href="/"
      className="flex items-center gap-2 select-none hover:opacity-90 transition-opacity"
    >
      {/* Logo Icon */}
      <Image
        src={iconSrc}
        alt="LeetCode Icon"
        width={28}
        height={28}
        className="object-contain"
        priority
      />
      {/* Text Logo Image */}
      <Image
        src={textSrc}
        alt="LeetCode Logo Text"
        width={100}
        height={20}
        className="object-contain h-[18px] w-auto"
        priority
      />
    </Link>
  );
}
export default Logo;
