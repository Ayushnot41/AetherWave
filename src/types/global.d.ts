/**
 * Global ambient declarations for AetherWeave
 */

// Allow CSS imports in TypeScript
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Extend global RequestInit for Next.js extended fetch options
declare global {
  interface RequestInit {
    next?: {
      revalidate?: number | false;
      tags?: string[];
    };
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_API_URL?: string;
    readonly NODE_ENV?: 'development' | 'production' | 'test';
  }
}

declare module 'next' {
  export interface NextConfig {
    [key: string]: unknown;
  }

  export interface Metadata {
    title?: string | { default: string; template: string };
    description?: string;
    manifest?: string;
    formatDetection?: {
      telephone?: boolean;
      date?: boolean;
      address?: boolean;
      email?: boolean;
      url?: boolean;
    };
    appleWebApp?: {
      capable?: boolean;
      statusBarStyle?: string;
      title?: string;
    };
    icons?: {
      icon?: string | { url: string; sizes?: string; type?: string }[];
      apple?: string | { url: string; sizes?: string; type?: string }[];
    };
  }

  export interface Viewport {
    width?: string;
    initialScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    themeColor?: string;
    viewportFit?: 'auto' | 'cover' | 'contain';
  }
}

declare module 'next/navigation' {
  export interface AppRouterInstance {
    back(): void;
    forward(): void;
    refresh(): void;
    push(href: string): void;
    replace(href: string): void;
    prefetch(href: string): void;
  }
  export function useRouter(): AppRouterInstance;
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module 'next/server' {
  export class NextResponse extends Response {
    static json<T = unknown>(data: T, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
}

declare module 'next/link' {
  import { ComponentType, AnchorHTMLAttributes, PropsWithChildren } from 'react';
  
  export interface LinkProps extends PropsWithChildren<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>> {
    href: string | { pathname?: string; query?: Record<string, string> };
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
  }
  
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module 'react-hook-form' {
  import type { RefCallback } from 'react';

  export type FieldValues = Record<string, unknown>;
  export type FieldErrors<TFieldValues extends FieldValues = FieldValues> = {
    [K in keyof TFieldValues]?: { type: string; message?: string };
  };
  export type Resolver<TFieldValues extends FieldValues = FieldValues> = (
    values: unknown,
    context?: unknown,
    options?: unknown,
  ) => Promise<{ values: TFieldValues; errors: FieldErrors<TFieldValues> }>;

  export interface UseFormRegisterReturn {
    onChange: (event: unknown) => Promise<boolean | void>;
    onBlur: (event: unknown) => Promise<boolean | void>;
    ref: RefCallback<unknown>;
    name: string;
  }

  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    register: (name: keyof TFieldValues & string, options?: unknown) => UseFormRegisterReturn;
    handleSubmit: (
      onValid: (data: TFieldValues) => void | Promise<void>,
      onInvalid?: unknown,
    ) => (e?: unknown) => Promise<void>;
    setValue: (name: keyof TFieldValues & string, value: unknown, options?: unknown) => void;
    formState: {
      errors: FieldErrors<TFieldValues>;
      isSubmitting: boolean;
      isValid: boolean;
    };
    reset: (values?: Partial<TFieldValues>) => void;
  }

  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    options?: unknown,
  ): UseFormReturn<TFieldValues>;
}

declare module 'zustand' {
  export type StateCreator<T> = (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T,
  ) => T;

  export type UseBoundStore<T> = {
    (): T;
    <U>(selector: (state: T) => U): U;
    getState: () => T;
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
    persist: {
      hasHydrated: () => boolean;
      onFinishHydration: (fn: () => void) => () => void;
      rehydrate: () => Promise<void>;
    };
  };

  export function create<T>(): (initializer: StateCreator<T>) => UseBoundStore<T>;
  export default create;
}

declare module 'zustand/middleware' {
  export function persist<T>(
    config: (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T,
    options: {
      name: string;
      partialize?: (state: T) => Partial<T>;
    },
  ): (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T;
}

declare module 'motion/react' {
  export * from 'motion';
  export {
    motion,
    AnimatePresence,
    useReducedMotion,
    useScroll,
    useTransform,
    useInView,
  } from 'motion';
}

declare module 'tailwind-merge' {
  export function twMerge(...classLists: unknown[]): string;
}

declare module 'clsx' {
  export type ClassValue = unknown;
  export function clsx(...inputs: ClassValue[]): string;
  export default clsx;
}

declare module 'class-variance-authority' {
  export function cva(...args: unknown[]): (...args: unknown[]) => string;
  export type VariantProps<T> = Record<string, unknown>;
}

declare module 'lucide-react' {
  import type { ComponentType, SVGProps } from 'react';
  export type IconProps = SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
    className?: string;
  };
  export type LucideIcon = ComponentType<IconProps>;

  export const Shield: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ThermometerSun: LucideIcon;
  export const Thermometer: LucideIcon;
  export const HeartPulse: LucideIcon;
  export const Coins: LucideIcon;
  export const Clock: LucideIcon;
  export const WifiOff: LucideIcon;
  export const Camera: LucideIcon;
  export const Mic: LucideIcon;
  export const MicOff: LucideIcon;
  export const Square: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const RefreshCcw: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Activity: LucideIcon;
  export const Sparkles: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Play: LucideIcon;
  export const Pause: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const FileText: LucideIcon;
  export const Upload: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Copy: LucideIcon;
  export const Check: LucideIcon;
  export const Zap: LucideIcon;
  export const ZapOff: LucideIcon;
  export const Building2: LucideIcon;
  export const Lock: LucideIcon;
  export const Globe: LucideIcon;
  export const Phone: LucideIcon;
  export const MapPin: LucideIcon;
  export const Compass: LucideIcon;
  export const Loader2: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Info: LucideIcon;
  export const X: LucideIcon;
  export const Inbox: LucideIcon;
}
