"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

export function Logo() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isLight = mounted && resolvedTheme === "light";
  const iconSrc = isLight ? "/leetcode-black.png" : "/leetcode-gold.png";
  const textSrc = isLight
    ? "/leetcode-text-black-fixed.svg"
    : "/leetcode-text-white-fixed.svg";

  return (
    <Link
      href="/"
      className="flex items-center gap-2 select-none hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all duration-200"
    >
      <Image
        src={iconSrc}
        alt="LeetCode Icon"
        width={28}
        height={28}
        className="object-contain size-6 sm:size-7"
        priority
      />
      <Image
        src={textSrc}
        alt="LeetCode Logo Text"
        width={100}
        height={20}
        className="object-contain h-[16px] sm:h-[18px] w-auto hidden sm:block"
        priority
      />
    </Link>
  );
}
export default Logo;
