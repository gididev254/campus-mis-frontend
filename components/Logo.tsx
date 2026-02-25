'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/imageUtils';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ width = 45, height = 45, className = '', showText = true }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show light mode logo during SSR/hydration to avoid flicker
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Image
          src="/logo.svg"
          alt="Embuni Campus Market Logo"
          width={width}
          height={height}
          priority
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR_DATA_URL}
        />
      </div>
    );
  }

  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const logoSrc = isDark ? '/logo-dark.svg' : '/logo.svg';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Image
          src={logoSrc}
          alt="Embuni Campus Market Logo"
          width={width}
          height={height}
          priority
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR_DATA_URL}
          className="transition-all duration-300"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-green-600 dark:text-green-400 leading-tight">
            EMBUNI
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400 -mt-1 leading-tight">
            CAMPUS MARKET
          </span>
        </div>
      )}
    </div>
  );
}
