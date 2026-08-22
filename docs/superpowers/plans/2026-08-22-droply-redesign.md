# Droply Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin Droply with the "Organic" design system and restructure the dashboard to a sidebar-nav layout, replacing HeroUI with Tailwind + shadcn/ui, while preserving all existing Clerk/ImageKit/Drizzle logic.

**Architecture:** HeroUI is removed in one shot (Task 1) rather than run side-by-side with shadcn — HeroUI's Tailwind plugin claims the same semantic color keys (`primary`, `background`, `foreground`, etc.) that shadcn's generated components hard-code, so running both simultaneously risks silent style collisions. This means the whole-repo build is intentionally red from Task 1 until Task 14 (every file that imports `@heroui/*` breaks immediately since the packages are uninstalled) — each task in between is verified by (a) a scoped `tsc` check that ignores the *already-known* `@heroui` errors in not-yet-migrated files and fails on anything new, and (b) manually loading that task's specific route(s) in the dev server. `npm run build`/`npm run lint` only need to pass repo-wide starting at Task 14.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS 3.4, shadcn/ui (Radix primitives + `class-variance-authority`), `sonner` (toasts), Clerk, Drizzle/Neon, ImageKit — unchanged.

**Spec:** `docs/superpowers/specs/2026-08-22-droply-redesign-design.md`

## Global Constraints

- No HeroUI anywhere in the final state — Tailwind + shadcn/ui only.
- Organic palette hex values are copied verbatim from the approved mockup's `styles.css` (reproduced in Task 1) — don't invent new colors.
- Fonts: Caprasimo (headings) via `next/font/google`, Figtree (body) via `next/font/google` — matches the existing `config/fonts.ts` + `next/font` convention already used for Inter.
- No dark mode — drop the forced `dark` class on `<html>` and the `next-themes` wiring; don't add a dark variant.
- `/sign-in` and `/sign-up` stay two separate routes with their existing Clerk logic untouched.
- Storage meter is display-only: `Σ file.size` (non-trash, non-folder) from whatever the dashboard currently has loaded, shown against a fixed `5 * 1024 * 1024 * 1024` byte constant. This inherits the pre-existing limitation that dashboard file-count/size figures are scoped to the current folder fetch, not the whole account — that's already true of today's `FileTabs` counts, not a regression introduced here.
- No new unit tests (no test runner exists in this repo, and this is a presentation-layer migration with no business-logic change). Verification is `tsc`/`lint`/build plus manual dev-server checks, per task.
- Translate the mockup's inline pixel values to the nearest Tailwind spacing/sizing step — exact-pixel fidelity isn't required, matching the composition is.
- Every existing API call, Clerk hook, Zod schema, and ImageKit/Drizzle handler keeps its current behavior — only its presentation and the UI library change.

---

## File Structure

**New files:**
- `components.json` — shadcn config
- `components/ui/{button,card,dialog,dropdown-menu,table,avatar,input,label,separator,tooltip,progress}.tsx` — shadcn-generated primitives
- `components/AuthSplitPanel.tsx` — shared decorative left panel for both auth pages
- `components/AuthToggle.tsx` — shared sign-in/sign-up link toggle
- `components/DashboardSidebar.tsx` — sidebar nav (All Files/Starred/Trash/Profile + storage meter), presentational
- `components/FileGrid.tsx` — grid-view file cards
- `components/FileUploadBanner.tsx` — replaces `FileUploadForm.tsx`

**Modified files:** `package.json`, `styles/globals.css`, `tailwind.config.js`, `config/fonts.ts`, `app/layout.tsx`, `app/providers.tsx`, `components/Navbar.tsx`, `app/page.tsx`, `components/SignInForm.tsx`, `app/sign-in/[[...sign-in]]/page.tsx`, `components/SignUpForm.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`, `components/ui/ConfirmationModal.tsx`, `components/FileIcon.tsx`, `components/FileActions.tsx`, `components/FileEmptyState.tsx`, `components/FolderNavigation.tsx`, `components/FileLoadingState.tsx`, `components/FileList.tsx`, `components/DashboardContent.tsx`, `components/UserProfile.tsx`, `app/dashboard/page.tsx`.

**Deleted files:** `components/FileTabs.tsx`, `components/FileActionButtons.tsx`, `components/FileUploadForm.tsx`.

---

## Task 1: Design-system foundation

**Files:**
- Modify: `package.json`, `styles/globals.css`, `tailwind.config.js`, `config/fonts.ts`, `app/layout.tsx`, `app/providers.tsx`
- Create: `components.json`

**Interfaces:**
- Produces: CSS custom properties `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius` (the shadcn contract every later component relies on), plus the raw `--color-*` organic tokens for hand-written Tailwind arbitrary values. Tailwind color keys `organic.bg/surface/text/accent/accent2/neutral` and font families `font-sans` (Figtree) / `font-heading` (Caprasimo).
- Produces: `Providers` (in `app/providers.tsx`) exporting the same `ImageKitAuthContext`/`useImageKitAuth` as before, now wrapping only `ImageKitProvider` + a `sonner` `<Toaster/>` — no more `HeroUIProvider`/`ToastProvider`/`NextThemesProvider`.

- [ ] **Step 1: Remove HeroUI/next-themes and add shadcn's runtime deps in `package.json`**

Remove these from `dependencies`: `@heroui/avatar`, `@heroui/badge`, `@heroui/button`, `@heroui/card`, `@heroui/code`, `@heroui/divider`, `@heroui/dropdown`, `@heroui/input`, `@heroui/kbd`, `@heroui/link`, `@heroui/listbox`, `@heroui/modal`, `@heroui/navbar`, `@heroui/progress`, `@heroui/snippet`, `@heroui/spinner`, `@heroui/switch`, `@heroui/system`, `@heroui/table`, `@heroui/tabs`, `@heroui/theme`, `@heroui/toast`, `@heroui/tooltip`, `@react-aria/ssr`, `@react-aria/visually-hidden`, `next-themes`.

Remove from `devDependencies`: `@react-types/shared`, `tailwind-variants`.

Add to `dependencies`: `"sonner": "^1.7.4"`, `"class-variance-authority": "^0.7.1"`, `"tailwindcss-animate": "^1.0.7"`, `"@radix-ui/react-slot": "^1.1.2"`.

(`framer-motion` and `intl-messageformat` were HeroUI's own transitive deps — nothing in this repo imports them directly, so leave them; they'll be pruned automatically by `npm install` once nothing in `package.json` depends on them, or removed explicitly in Task 14's final sweep if still present.)

- [ ] **Step 2: Install**

Run: `npm install`
Expected: completes with no missing-peer-dependency errors.

- [ ] **Step 3: Create `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

- [ ] **Step 4: Rewrite `styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Organic design system tokens — copied from the approved mockup's styles.css */
  --color-bg: #f5ead8;
  --color-surface: #ebddc5;
  --color-text: #201e1d;
  --color-accent: #c67139;
  --color-accent-2: #7a8a5e;
  --color-divider: color-mix(in srgb, #201e1d 16%, transparent);

  --color-neutral-100: #f9f4ed;
  --color-neutral-200: #eee7db;
  --color-neutral-300: #dcd3c4;
  --color-neutral-400: #c0b6a5;
  --color-neutral-500: #a19786;
  --color-neutral-600: #82796a;
  --color-neutral-700: #645c50;
  --color-neutral-800: #474238;
  --color-neutral-900: #2e2b25;

  --color-accent-100: #fff2eb;
  --color-accent-200: #ffe1d0;
  --color-accent-300: #ffc6a5;
  --color-accent-400: #f6a06b;
  --color-accent-500: #d67f48;
  --color-accent-600: #b2622d;
  --color-accent-700: #8c491a;
  --color-accent-800: #643312;
  --color-accent-900: #402310;

  --color-accent-2-100: #f0fae1;
  --color-accent-2-200: #e1eecc;
  --color-accent-2-300: #ccdbb2;
  --color-accent-2-400: #aebf92;
  --color-accent-2-500: #8fa073;
  --color-accent-2-600: #728157;
  --color-accent-2-700: #56633f;
  --color-accent-2-800: #3d472b;
  --color-accent-2-900: #272e1b;

  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 28px;

  --shadow-sm: 0 1px 2px color-mix(in srgb, #2e2b25 14%, transparent);
  --shadow-md: 0 3px 10px color-mix(in srgb, #2e2b25 16%, transparent);
  --shadow-lg: 0 12px 32px color-mix(in srgb, #2e2b25 22%, transparent);

  /* shadcn/ui semantic aliases — every generated component reads these */
  --background: var(--color-bg);
  --foreground: var(--color-text);
  --card: var(--color-surface);
  --card-foreground: var(--color-text);
  --popover: var(--color-surface);
  --popover-foreground: var(--color-text);
  --primary: var(--color-accent);
  --primary-foreground: var(--color-bg);
  --secondary: var(--color-neutral-100);
  --secondary-foreground: var(--color-text);
  --muted: var(--color-neutral-200);
  --muted-foreground: var(--color-neutral-700);
  --accent: var(--color-accent-100);
  --accent-foreground: var(--color-accent-800);
  --destructive: var(--color-accent-700);
  --destructive-foreground: var(--color-bg);
  --border: var(--color-divider);
  --input: var(--color-divider);
  --ring: var(--color-accent);
  --radius: var(--radius-md);
}

body {
  font-family: var(--font-body), system-ui, sans-serif;
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading), system-ui, sans-serif;
  letter-spacing: -0.015em;
}
```

Note: there is no `--destructive` red in this design (the mockup's "Delete permanently"/"Empty trash" buttons are literally `btn-primary`, not a danger color) — `--destructive` is set to a deeper terracotta only so shadcn's `destructive` Button variant looks on-brand if anything reaches for it. `ConfirmationModal` (Task 7) uses the default/primary variant to match the mockup exactly, not `destructive`.

- [ ] **Step 5: Rewrite `tailwind.config.js`**

```js
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        organic: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          text: "var(--color-text)",
          accent: {
            DEFAULT: "var(--color-accent)",
            100: "var(--color-accent-100)",
            200: "var(--color-accent-200)",
            300: "var(--color-accent-300)",
            400: "var(--color-accent-400)",
            500: "var(--color-accent-500)",
            600: "var(--color-accent-600)",
            700: "var(--color-accent-700)",
            800: "var(--color-accent-800)",
            900: "var(--color-accent-900)",
          },
          accent2: {
            DEFAULT: "var(--color-accent-2)",
            100: "var(--color-accent-2-100)",
            200: "var(--color-accent-2-200)",
            300: "var(--color-accent-2-300)",
            400: "var(--color-accent-2-400)",
            500: "var(--color-accent-2-500)",
            600: "var(--color-accent-2-600)",
            700: "var(--color-accent-2-700)",
            800: "var(--color-accent-2-800)",
            900: "var(--color-accent-2-900)",
          },
          neutral: {
            100: "var(--color-neutral-100)",
            200: "var(--color-neutral-200)",
            300: "var(--color-neutral-300)",
            400: "var(--color-neutral-400)",
            500: "var(--color-neutral-500)",
            600: "var(--color-neutral-600)",
            700: "var(--color-neutral-700)",
            800: "var(--color-neutral-800)",
            900: "var(--color-neutral-900)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        sans: ["var(--font-body)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.sans],
      },
      boxShadow: {
        "organic-sm": "var(--shadow-sm)",
        "organic-md": "var(--shadow-md)",
        "organic-lg": "var(--shadow-lg)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

module.exports = config;
```

- [ ] **Step 6: Rewrite `config/fonts.ts`**

```ts
import { Caprasimo, Figtree } from "next/font/google";

export const fontHeading = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

export const fontBody = Figtree({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
});
```

- [ ] **Step 7: Update `app/layout.tsx`** — drop the forced `dark` class, use the new fonts

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from './providers';
import { fontHeading, fontBody } from '@/config/fonts';

export const metadata: Metadata = {
  title: 'Droply',
  description: 'Secure cloud storage for your images, powered by ImageKit',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${fontHeading.variable} ${fontBody.variable} antialiased bg-background text-foreground`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 8: Rewrite `app/providers.tsx`**

```tsx
'use client';

import { ImageKitProvider } from 'imagekitio-next';
import { Toaster } from 'sonner';
import * as React from 'react';
import { createContext, useContext } from 'react';

export interface ProvidersProps {
  children: React.ReactNode;
}

export const ImageKitAuthContext = createContext<{
  authenticate: () => Promise<{
    signature: string;
    token: string;
    expire: number;
  }>;
}>({
  authenticate: async () => ({ signature: '', token: '', expire: 0 }),
});

export const useImageKitAuth = () => useContext(ImageKitAuthContext);

const authenticator = async () => {
  try {
    const response = await fetch('/api/imagekit-auth');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ImageKitProvider
      authenticator={authenticator}
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ''}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}
    >
      <ImageKitAuthContext.Provider value={{ authenticate: authenticator }}>
        <Toaster position="top-right" richColors />
        {children}
      </ImageKitAuthContext.Provider>
    </ImageKitProvider>
  );
}
```

- [ ] **Step 9: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output referencing `app/layout.tsx`, `app/providers.tsx`, `config/fonts.ts`, `tailwind.config.js`, or `styles/globals.css` — every remaining error at this point should come from files this task didn't touch (still importing now-uninstalled `@heroui/*`, filtered out by the grep -v).

Run: `npm run dev`, then open `http://localhost:3000/`.
Expected: the dev server boots without crashing; the page shows a Next.js compile-error overlay naming `@heroui/button` (or similar) inside `app/page.tsx`/`components/Navbar.tsx` — NOT an error in `layout.tsx` or `providers.tsx`. That confirms this task's own files are clean; `page.tsx`/`Navbar.tsx` are fixed in Tasks 3–4.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json components.json styles/globals.css tailwind.config.js config/fonts.ts app/layout.tsx app/providers.tsx
git commit -m "chore: replace HeroUI with shadcn/ui foundation and Organic design tokens"
```

---

## Task 2: Add shadcn UI primitives

**Files:**
- Create: `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/dialog.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/table.tsx`, `components/ui/avatar.tsx`, `components/ui/input.tsx`, `components/ui/label.tsx`, `components/ui/separator.tsx`, `components/ui/tooltip.tsx`, `components/ui/progress.tsx`

**Interfaces:**
- Produces: `Button` (variants `default|outline|ghost|link|destructive`, sizes `default|sm|lg|icon`), `Card`/`CardHeader`/`CardContent`/`CardFooter`, `Dialog`/`DialogContent`/`DialogHeader`/`DialogFooter`/`DialogTitle`, `DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuItem`, `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableCell`/`TableHead`, `Avatar`/`AvatarImage`/`AvatarFallback`, `Input`, `Label`, `Separator`, `Tooltip`/`TooltipTrigger`/`TooltipContent`/`TooltipProvider`, `Progress` — all imported from `@/components/ui/<name>`, all consumed starting Task 3.

- [ ] **Step 1: Generate the primitives**

Run: `npx shadcn@latest add button card dialog dropdown-menu table avatar input label separator tooltip progress -y`
Expected: creates the 11 files listed above under `components/ui/`, and adds their Radix peer packages (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-avatar`, `@radix-ui/react-label`, `@radix-ui/react-separator`, `@radix-ui/react-tooltip`, `@radix-ui/react-progress`) to `package.json`/`package-lock.json` automatically.

- [ ] **Step 2: Verify the files exist and nothing else broke**

Run: `ls components/ui`
Expected: the 11 new files, plus the pre-existing `Badge.tsx` and `ConfirmationModal.tsx`.

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output (the new files aren't consumed by anything yet, so they can't introduce new errors; if this prints anything, one of the generated files failed to type-check on its own — investigate before moving on).

- [ ] **Step 3: Commit**

```bash
git add components/ui package.json package-lock.json
git commit -m "chore: add shadcn/ui primitives"
```

---

## Task 3: Rebuild `components/Navbar.tsx`

**Files:**
- Modify: `components/Navbar.tsx`

**Interfaces:**
- Consumes: `Button` (`components/ui/button.tsx`), `DropdownMenu*` (`components/ui/dropdown-menu.tsx`), `Avatar*` (`components/ui/avatar.tsx`) from Task 2.
- Produces: same `Navbar({ user }: { user?: SerializedUser | null })` signature consumed by `app/page.tsx`, `app/dashboard/page.tsx`, `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx` — unchanged, so those call sites don't need edits for this task alone.

- [ ] **Step 1: Rewrite `components/Navbar.tsx`**, keeping every existing hook (`useClerk`, `useRouter`, `usePathname`, the scroll/mobile-menu/click-outside `useEffect`s) verbatim, swapping only the rendered markup:

```tsx
"use client";

import { useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, User, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface SerializedUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  username?: string | null;
  emailAddress?: string | null;
}

interface NavbarProps {
  user?: SerializedUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isOnDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-menu-button="true"]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  const userDetails = {
    initials: user
      ? `${user.firstName || ""} ${user.lastName || ""}`
          .trim()
          .split(" ")
          .map((name) => name?.[0] || "")
          .join("")
          .toUpperCase() || "U"
      : "U",
    displayName: user
      ? user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.username || user.emailAddress || "User"
      : "User",
    email: user?.emailAddress || "",
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur transition-shadow ${
        isScrolled ? "shadow-organic-sm" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-[17px] text-primary-foreground">
            D
          </div>
          <span className="font-heading text-lg">Droply</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get started</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3">
              {!isOnDashboard && (
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto gap-2 rounded-full px-2 py-1.5"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl || undefined} />
                      <AvatarFallback>
                        {userDetails.initials || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm text-muted-foreground sm:inline">
                      {userDetails.displayName}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => router.push("/dashboard?tab=profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    My Files
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-organic-accent-700 focus:text-organic-accent-700"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SignedIn>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <SignedIn>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.imageUrl || undefined} />
              <AvatarFallback>
                {userDetails.initials || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </SignedIn>
          <button
            className="z-50 p-2"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            data-menu-button="true"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-organic-text/20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          ref={mobileMenuRef}
          className={`fixed bottom-0 right-0 top-0 z-40 flex w-4/5 max-w-sm flex-col bg-background px-6 pt-20 shadow-organic-lg transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden`}
        >
          <SignedOut>
            <div className="flex flex-col items-center gap-4">
              <Link href="/sign-in" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/sign-up" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-border py-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.imageUrl || undefined} />
                  <AvatarFallback>{userDetails.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userDetails.displayName}</p>
                  <p className="text-sm text-muted-foreground">{userDetails.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {!isOnDashboard && (
                  <Link
                    href="/dashboard"
                    className="rounded-md px-3 py-2 transition-colors hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/dashboard?tab=profile"
                  className="rounded-md px-3 py-2 transition-colors hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  className="mt-4 rounded-md px-3 py-2 text-left text-organic-accent-700 transition-colors hover:bg-muted"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for `components/Navbar.tsx`.

Run: `npm run dev`, open `http://localhost:3000/`.
Expected: the compile-error overlay now points only at `app/page.tsx` (still using `@heroui/button`/`@heroui/card`) — `Navbar` itself renders (visible above whatever error boundary shows for the rest of the page, or check `/sign-in`, which after Task 3 only fails inside `SignInForm`, confirming Navbar renders correctly there: logo, ghost Sign in / primary Get started buttons, mobile hamburger).

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: restyle Navbar with shadcn/ui"
```

---

## Task 4: Rebuild the landing page (`app/page.tsx`)

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Button`, `Card`/`CardContent` (Task 2), `Navbar` (Task 3).

- [ ] **Step 1: Rewrite `app/page.tsx`**

```tsx
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  CloudUpload,
  Shield,
  Folder,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative mx-auto max-w-[1180px] px-6 pb-10 pt-16 md:pb-16 md:pt-20">
          <div className="pointer-events-none absolute -top-6 left-[6%] h-28 w-28 rounded-full bg-organic-accent2-200 opacity-55" />
          <div className="pointer-events-none absolute -bottom-6 left-[34%] h-16 w-16 rounded-full bg-organic-accent-200 opacity-60" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="inline-flex rounded-full bg-organic-accent-100 px-3 py-1 text-xs tracking-wide text-organic-accent-800">
                Personal cloud storage
              </span>
              <h1 className="mt-4 max-w-lg text-4xl md:text-5xl">
                Your images, kept somewhere nicer.
              </h1>
              <p className="mt-4 max-w-md text-lg text-muted-foreground">
                Droply is a quiet place to drop your photos and files —
                organized, private, and yours alone. No clutter, no noise.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button size="lg">Get started free</Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button size="lg" variant="outline">Sign in</Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg">
                      Go to Dashboard
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </div>

            <div className="relative order-first aspect-square overflow-hidden rounded-[28px] bg-organic-accent2-100 lg:order-last">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-organic-accent/10 blur-3xl" />
                <ImageIcon className="relative h-24 w-24 text-organic-accent/70 md:h-32 md:w-32" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 py-14">
          <h2 className="max-w-md">Everything your files need, nothing they don't</h2>
          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <Card className="border-none shadow-organic-sm">
              <CardContent className="p-7">
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-organic-accent-100">
                  <CloudUpload className="h-[22px] w-[22px] text-organic-accent-700" />
                </div>
                <h3 className="mt-2 text-lg">Quick uploads</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Drag, drop, done. Your files land where you left off.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-organic-sm">
              <CardContent className="p-7">
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-organic-accent2-100">
                  <Folder className="h-[22px] w-[22px] text-organic-accent2-700" />
                </div>
                <h3 className="mt-2 text-lg">Smart organization</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Folders, stars and search keep things easy to find.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-organic-sm sm:col-span-2 md:col-span-1">
              <CardContent className="p-7">
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-organic-accent-100">
                  <Shield className="h-[22px] w-[22px] text-organic-accent-700" />
                </div>
                <h3 className="mt-2 text-lg">Locked down</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Private by default. Your images, your eyes only.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="relative mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-6 overflow-hidden rounded-[28px] bg-organic-accent2-100 px-8 py-12 sm:flex-row">
            <div className="pointer-events-none absolute -left-10 -top-16 h-36 w-36 rounded-full bg-organic-accent2-300 opacity-50" />
            <div className="pointer-events-none absolute bottom-[-70px] left-40 h-24 w-24 rounded-full bg-organic-accent-300 opacity-40" />
            <h2 className="relative max-w-md text-center sm:text-left">Ready when you are.</h2>
            <SignedOut>
              <Link href="/sign-up" className="relative">
                <Button size="lg">Let's go</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="relative">
                <Button size="lg">Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1180px] justify-between border-t border-border px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-heading text-xs text-primary-foreground">
            D
          </div>
          <span className="font-heading">Droply</span>
        </div>
        <span className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Droply
        </span>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for `app/page.tsx`.

Run: `npm run dev`, open `http://localhost:3000/`.
Expected: landing page renders fully (no error overlay) — hero with tag/headline/CTAs, 3 feature cards, CTA banner, footer, in the cream/terracotta palette with Caprasimo headings. Toggle signed-in/signed-out (via Clerk) and confirm the CTA buttons swap correctly.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: restyle landing page with Organic design system"
```

---

## Task 5: Sign-in page

**Files:**
- Create: `components/AuthSplitPanel.tsx`, `components/AuthToggle.tsx`
- Modify: `components/SignInForm.tsx`, `app/sign-in/[[...sign-in]]/page.tsx`

**Interfaces:**
- Produces: `AuthSplitPanel()` (no props — static decorative panel) and `AuthToggle({ active }: { active: "signin" | "signup" })`, both reused by Task 6's sign-up page.
- Consumes: `Card`/`CardContent`/`CardHeader`, `Input`, `Label`, `Button` (Task 2).

- [ ] **Step 1: Create `components/AuthSplitPanel.tsx`**

```tsx
export default function AuthSplitPanel() {
  return (
    <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] bg-organic-accent2-100 p-10">
      <div className="absolute left-10 top-10 h-16 w-16 rounded-full bg-organic-accent-200" />
      <div className="absolute left-[90px] top-[90px] h-8 w-8 rounded-full bg-organic-accent2-300" />
      <h2 className="relative max-w-xs">A quiet, tidy home for your files.</h2>
      <p className="relative text-muted-foreground">Simple. Secure. Fast.</p>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/AuthToggle.tsx`**

```tsx
import Link from "next/link";

export default function AuthToggle({ active }: { active: "signin" | "signup" }) {
  const tabClass = (tab: "signin" | "signup") =>
    `flex-1 rounded-full py-2 text-center text-sm font-heading transition-colors ${
      active === tab ? "bg-primary text-primary-foreground" : "text-foreground"
    }`;

  return (
    <div className="mb-6 flex rounded-full border border-border p-1">
      <Link href="/sign-in" className={tabClass("signin")}>
        Sign in
      </Link>
      <Link href="/sign-up" className={tabClass("signup")}>
        Sign up
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `components/SignInForm.tsx`** — keep `useForm`/`zodResolver`/`useSignIn`/`onSubmit` exactly as-is, only swap the markup

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";
import AuthToggle from "@/components/AuthToggle";

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Sign-in incomplete:", result);
        setAuthError("Sign-in could not be completed. Please try again.");
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during sign-in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none shadow-organic-md">
      <CardContent className="p-9">
        <AuthToggle active="signin" />
        <h3>Welcome back</h3>
        <p className="mb-5 text-muted-foreground">Sign in to access your files.</p>

        {authError && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-organic-accent-100 p-4 text-organic-accent-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="identifier">Email</Label>
            <Input
              id="identifier"
              type="email"
              placeholder="your.email@example.com"
              {...register("identifier")}
            />
            {errors.identifier && (
              <p className="text-sm text-organic-accent-700">{errors.identifier.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-organic-accent-700">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Rewrite `app/sign-in/[[...sign-in]]/page.tsx`**

```tsx
import SignInForm from "@/components/SignInForm";
import Navbar from "@/components/Navbar";
import AuthSplitPanel from "@/components/AuthSplitPanel";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-center gap-12 px-6 py-8 lg:grid-cols-2">
        <AuthSplitPanel />
        <SignInForm />
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for these 4 files.

Run: `npm run dev`, open `http://localhost:3000/sign-in`.
Expected: split-panel layout renders (decorative left panel + card), the Sign in/Sign up toggle at the top of the card, and clicking "Sign up" in the toggle navigates to `/sign-up` (still broken until Task 6 — that's expected). Submit the form with an invalid email and confirm the Zod validation message shows under the field; submit real credentials (or wrong ones) and confirm Clerk's `authError` banner shows correctly.

- [ ] **Step 6: Commit**

```bash
git add components/AuthSplitPanel.tsx components/AuthToggle.tsx components/SignInForm.tsx "app/sign-in/[[...sign-in]]/page.tsx"
git commit -m "feat: restyle sign-in page with shadcn/ui"
```

---

## Task 6: Sign-up page

**Files:**
- Modify: `components/SignUpForm.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`

**Interfaces:**
- Consumes: `AuthSplitPanel`, `AuthToggle` (Task 5), `Card`/`CardContent`, `Input`, `Label`, `Button` (Task 2).

- [ ] **Step 1: Rewrite `components/SignUpForm.tsx`** — keep `useForm`/`zodResolver`/`useSignUp`/`onSubmit`/`handleVerificationSubmit` exactly as-is, only swap the markup, in both the `verifying` branch and the main form

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { signUpSchema } from "@/schemas/signUpSchema";
import AuthToggle from "@/components/AuthToggle";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", passwordConfirmation: "" },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signUp.create({ emailAddress: data.email, password: data.password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (error: any) {
      console.error("Sign-up error:", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during sign-up. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Verification incomplete:", result);
        setVerificationError("Verification could not be completed. Please try again.");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationError(
        error.errors?.[0]?.message ||
          "An error occurred during verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <Card className="border-none shadow-organic-md">
        <CardContent className="p-9">
          <h3>Verify your email</h3>
          <p className="mb-5 text-muted-foreground">
            We've sent a verification code to your email
          </p>

          {verificationError && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-organic-accent-100 p-4 text-organic-accent-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{verificationError}</p>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="verificationCode">Verification code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify email"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive a code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                  }
                }}
                className="font-medium text-primary hover:underline"
              >
                Resend code
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-organic-md">
      <CardContent className="p-9">
        <AuthToggle active="signup" />
        <h3>Create your account</h3>
        <p className="mb-5 text-muted-foreground">
          Start keeping your files somewhere nicer.
        </p>

        {authError && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-organic-accent-100 p-4 text-organic-accent-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your.email@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-organic-accent-700">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-organic-accent-700">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="passwordConfirmation">Confirm password</Label>
            <div className="relative">
              <Input
                id="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("passwordConfirmation")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.passwordConfirmation && (
              <p className="text-sm text-organic-accent-700">{errors.passwordConfirmation.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
            <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Rewrite `app/sign-up/[[...sign-up]]/page.tsx`** (mirrors the sign-in page)

```tsx
import SignUpForm from "@/components/SignUpForm";
import Navbar from "@/components/Navbar";
import AuthSplitPanel from "@/components/AuthSplitPanel";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-center gap-12 px-6 py-8 lg:grid-cols-2">
        <AuthSplitPanel />
        <SignUpForm />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for these 2 files.

Run: `npm run dev`, open `http://localhost:3000/sign-up`.
Expected: split-panel layout renders; the toggle now shows "Sign up" active; submitting a valid new account swaps the card to the verification-code step (same visual card style); entering the emailed code completes sign-up and redirects to `/dashboard` (which is still broken until later tasks — expected, but the redirect itself firing confirms the Clerk flow is intact).

- [ ] **Step 4: Commit**

```bash
git add components/SignUpForm.tsx "app/sign-up/[[...sign-up]]/page.tsx"
git commit -m "feat: restyle sign-up page with shadcn/ui"
```

---

## Task 7: Rebuild `components/ui/ConfirmationModal.tsx` on shadcn Dialog

**Files:**
- Modify: `components/ui/ConfirmationModal.tsx`

**Interfaces:**
- Consumes: `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter` (Task 2).
- Produces: same props API as before — `isOpen`, `onOpenChange`, `title`, `description`, `icon?`, `iconColor?`, `confirmText?`, `cancelText?`, `confirmColor?`, `onConfirm`, `isDangerous?`, `warningMessage?` — so `FileList.tsx` (Task 12) doesn't need any prop-shape changes when it starts using this. `confirmColor` is accepted for API compatibility but the confirm button always renders as the default (primary) `Button` variant — the source design has no separate danger color; its own "Delete permanently"/"Empty trash" buttons are plain primary buttons.

- [ ] **Step 1: Rewrite `components/ui/ConfirmationModal.tsx`**

```tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "danger" | "warning" | "success" | "default";
  onConfirm: () => void;
  isDangerous?: boolean;
  warningMessage?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconColor = "text-organic-accent-700",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isDangerous = false,
  warningMessage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
            {title}
          </DialogTitle>
        </DialogHeader>

        {isDangerous && warningMessage && (
          <div className="rounded-lg bg-organic-accent-100 p-4 text-organic-accent-800">
            <div className="flex items-start gap-3">
              {Icon && <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColor}`} />}
              <div>
                <p className="font-medium">This action cannot be undone</p>
                <p className="mt-1 text-sm">{warningMessage}</p>
              </div>
            </div>
          </div>
        )}
        <p>{description}</p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {Icon && <Icon className="mr-1 h-4 w-4" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for this file (it isn't imported by anything using `@heroui` any more, so this should be fully clean).

- [ ] **Step 3: Commit**

```bash
git add components/ui/ConfirmationModal.tsx
git commit -m "feat: rebuild ConfirmationModal on shadcn Dialog"
```

---

## Task 8: File-list leaf components

**Files:**
- Modify: `components/FileIcon.tsx`, `components/FileActions.tsx`, `components/FileEmptyState.tsx`, `components/FolderNavigation.tsx`, `components/FileLoadingState.tsx`

**Interfaces:**
- Produces: `FileIcon({ file, variant = "row" }: { file: FileType; variant?: "row" | "tile" })` — `variant="tile"` renders a 100px-tall centered icon/thumbnail for grid cards (Task 9); `variant="row"` (default) keeps today's small 18–48px icon for table rows (Task 12).
- Produces: `FileActions({ file, onStar, onTrash, onDelete, onDownload, compact? }: FileActionsProps)` — same 4 handler props as before, plus an optional `compact` boolean (icon-only buttons, used by grid cards; `compact` absent/false keeps today's icon+label buttons for table rows).
- `FileEmptyState`, `FolderNavigation`, `FileLoadingState` keep their exact existing prop signatures.

- [ ] **Step 1: Rewrite `components/FileIcon.tsx`**

```tsx
"use client";

import { Folder, FileText, Video } from "lucide-react";
import { IKImage } from "imagekitio-next";
import type { File as FileType } from "@/lib/db/schema";

interface FileIconProps {
  file: FileType;
  variant?: "row" | "tile";
}

export default function FileIcon({ file, variant = "row" }: FileIconProps) {
  const size = variant === "tile" ? 34 : 18;
  const isTile = variant === "tile";

  if (file.isFolder) {
    return (
      <Folder
        width={size}
        height={size}
        className={isTile ? "text-organic-accent-700" : "h-[18px] w-[18px] text-organic-accent-700"}
      />
    );
  }

  const fileType = file.type.split("/")[0];

  if (fileType === "image") {
    return (
      <div
        className={
          isTile
            ? "relative h-full w-full overflow-hidden"
            : "relative h-12 w-12 overflow-hidden rounded"
        }
      >
        <IKImage
          path={file.path}
          transformation={[{ height: 200, width: 200, focus: "auto", quality: 80, dpr: 2 }]}
          loading="lazy"
          lqip={{ active: true }}
          alt={file.name}
          style={{ objectFit: "cover", height: "100%", width: "100%" }}
        />
      </div>
    );
  }

  const cls = isTile ? "text-organic-accent2-700" : "h-[18px] w-[18px] text-organic-accent2-700";

  if (fileType === "application" && file.type.includes("pdf")) {
    return <FileText width={size} height={size} className={cls} />;
  }
  if (fileType === "video") {
    return <Video width={size} height={size} className={cls} />;
  }
  return <FileText width={size} height={size} className={cls} />;
}

/** Tile background color for grid cards — folders and documents get a tinted
 * backdrop behind their icon; images fill the tile with their own thumbnail. */
export function fileTileBg(file: FileType) {
  if (file.isFolder) return "bg-organic-accent-100";
  const fileType = file.type.split("/")[0];
  if (fileType === "image") return "bg-organic-neutral-200";
  return "bg-organic-accent2-100";
}
```

- [ ] **Step 2: Rewrite `components/FileActions.tsx`**

```tsx
"use client";

import { Star, Trash, X, ArrowUpFromLine, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { File as FileType } from "@/lib/db/schema";

interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
  compact?: boolean;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
  compact = false,
}: FileActionsProps) {
  const size = compact ? "icon" : "sm";

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {!file.isTrash && !file.isFolder && (
        <Button variant="outline" size={size} onClick={() => onDownload(file)}>
          <Download className="h-3.5 w-3.5" />
          {!compact && <span className="ml-1">Download</span>}
        </Button>
      )}

      {!file.isTrash && (
        <Button variant="outline" size={size} onClick={() => onStar(file.id)}>
          <Star
            className={`h-3.5 w-3.5 ${file.isStarred ? "fill-organic-accent text-organic-accent" : ""}`}
          />
          {!compact && <span className="ml-1">{file.isStarred ? "Unstar" : "Star"}</span>}
        </Button>
      )}

      <Button variant="outline" size={size} onClick={() => onTrash(file.id)}>
        {file.isTrash ? <ArrowUpFromLine className="h-3.5 w-3.5" /> : <Trash className="h-3.5 w-3.5" />}
        {!compact && <span className="ml-1">{file.isTrash ? "Restore" : "Delete"}</span>}
      </Button>

      {file.isTrash && (
        <Button variant="outline" size={size} onClick={() => onDelete(file)}>
          <X className="h-3.5 w-3.5" />
          {!compact && <span className="ml-1">Remove</span>}
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `components/FileEmptyState.tsx`**

```tsx
"use client";

import { File } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FileEmptyStateProps {
  activeTab: string;
}

export default function FileEmptyState({ activeTab }: FileEmptyStateProps) {
  return (
    <Card className="border-none shadow-organic-sm">
      <CardContent className="flex flex-col items-center py-16 text-center">
        <File className="h-10 w-10 text-primary opacity-60" />
        <h3 className="mt-3">
          {activeTab === "all" && "No files available"}
          {activeTab === "starred" && "No starred files"}
          {activeTab === "trash" && "Trash is empty"}
        </h3>
        <p className="mt-2 max-w-md text-muted-foreground">
          {activeTab === "all" &&
            "Upload your first file to get started with your personal cloud storage"}
          {activeTab === "starred" &&
            "Mark important files with a star to find them quickly when you need them"}
          {activeTab === "trash" &&
            "Files you delete will appear here for 30 days before being permanently removed"}
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Rewrite `components/FolderNavigation.tsx`**

```tsx
"use client";

import { ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FolderNavigationProps {
  folderPath: Array<{ id: string; name: string }>;
  navigateUp: () => void;
  navigateToPathFolder: (index: number) => void;
}

export default function FolderNavigation({
  folderPath,
  navigateUp,
  navigateToPathFolder,
}: FolderNavigationProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-1 text-sm">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={navigateUp}
        disabled={folderPath.length === 0}
      >
        <ArrowUpFromLine className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToPathFolder(-1)}
        className={folderPath.length === 0 ? "font-semibold" : ""}
      >
        Home
      </Button>
      {folderPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-1 text-muted-foreground">/</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPathFolder(index)}
            className={`max-w-[150px] overflow-hidden text-ellipsis ${
              index === folderPath.length - 1 ? "font-semibold" : ""
            }`}
            title={folder.name}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Rewrite `components/FileLoadingState.tsx`**

```tsx
"use client";

import { Loader2 } from "lucide-react";

export default function FileLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading your files...</p>
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for these 5 files. (They aren't consumed by anything yet since `FileList.tsx` still imports the old `@heroui`-based versions of some siblings until Task 12 — that's fine, these files themselves are self-contained and type-check independently.)

- [ ] **Step 7: Commit**

```bash
git add components/FileIcon.tsx components/FileActions.tsx components/FileEmptyState.tsx components/FolderNavigation.tsx components/FileLoadingState.tsx
git commit -m "feat: restyle file-list leaf components with shadcn/ui"
```

---

## Task 9: `components/FileGrid.tsx` (new grid view)

**Files:**
- Create: `components/FileGrid.tsx`

**Interfaces:**
- Consumes: `FileIcon`/`fileTileBg` (Task 8), `FileActions` (Task 8).
- Produces: `FileGrid({ files, onOpen, onStar, onTrash, onDelete, onDownload }: FileGridProps)` where `files: FileType[]`, `onOpen: (file: FileType) => void`, and the other 4 handlers match `FileActions`' shape — consumed by `FileList.tsx` in Task 12.

- [ ] **Step 1: Create `components/FileGrid.tsx`**

```tsx
"use client";

import { Star } from "lucide-react";
import type { File as FileType } from "@/lib/db/schema";
import FileIcon, { fileTileBg } from "@/components/FileIcon";
import FileActions from "@/components/FileActions";

interface FileGridProps {
  files: FileType[];
  onOpen: (file: FileType) => void;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileGrid({
  files,
  onOpen,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {files.map((file) => (
        <div
          key={file.id}
          className={`overflow-hidden rounded-[24px] bg-card shadow-organic-sm transition-transform hover:-translate-y-0.5 ${
            file.isFolder || file.type.startsWith("image/") ? "cursor-pointer" : ""
          }`}
          onClick={() => onOpen(file)}
        >
          <div className={`flex h-[100px] items-center justify-center ${fileTileBg(file)}`}>
            <FileIcon file={file} variant="tile" />
          </div>
          <div className="p-3.5">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">{file.name}</span>
              {file.isStarred && (
                <Star className="h-3 w-3 flex-shrink-0 fill-organic-accent text-organic-accent" />
              )}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {file.isFolder ? "—" : formatSize(file.size)} ·{" "}
              {new Date(file.createdAt).toLocaleDateString()}
            </div>
            <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
              <FileActions
                file={file}
                onStar={onStar}
                onTrash={onTrash}
                onDelete={onDelete}
                onDownload={onDownload}
                compact
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for this file.

- [ ] **Step 3: Commit**

```bash
git add components/FileGrid.tsx
git commit -m "feat: add grid view for file list"
```

---

## Task 10: `components/FileUploadBanner.tsx` (replaces `FileUploadForm.tsx`)

**Files:**
- Create: `components/FileUploadBanner.tsx`
- Delete: `components/FileUploadForm.tsx`

**Interfaces:**
- Consumes: `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter`, `Input`, `Label`, `Button` (Task 2).
- Produces: `FileUploadBanner({ userId, onUploadSuccess, currentFolder }: FileUploadBannerProps)` — same prop names/types as the old `FileUploadForm` (`userId: string`, `onUploadSuccess?: () => void`, `currentFolder?: string | null`), consumed by `FileList.tsx` in Task 12. Internally uses `sonner`'s `toast` instead of `addToast`.

- [ ] **Step 1: Create `components/FileUploadBanner.tsx`** — same upload/folder-creation logic as the old form, new banner presentation

```tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, FolderPlus, FileUp } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface FileUploadBannerProps {
  userId: string;
  onUploadSuccess?: () => void;
  currentFolder?: string | null;
}

export default function FileUploadBanner({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadBannerProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const uploadFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolder) formData.append("parentId", currentFolder);

    setUploading(true);
    setProgress(0);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      toast.success(`${file.name} has been uploaded successfully.`);
      onUploadSuccess?.();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("We couldn't upload your file. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a valid folder name.");
      return;
    }

    setCreatingFolder(true);
    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId,
        parentId: currentFolder,
      });

      toast.success(`Folder "${folderName}" has been created successfully.`);
      setFolderName("");
      setFolderModalOpen(false);
      onUploadSuccess?.();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("We couldn't create the folder. Please try again.");
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <>
      <div
        className="mb-5 flex items-center gap-4 rounded-[24px] border-2 border-dashed p-5"
        style={{
          borderColor: dragOver ? "var(--color-accent)" : "var(--color-divider)",
          background: dragOver ? "var(--color-accent-100)" : "var(--color-surface)",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-organic-accent-100">
          <Upload className="h-[22px] w-[22px] text-organic-accent-700" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">
            {uploading ? `Uploading... ${progress}%` : "Drag and drop to upload"}
          </div>
          <div className="text-sm text-muted-foreground">
            Images up to 5MB, kept private to you
          </div>
        </div>
        <Button variant="outline" onClick={() => setFolderModalOpen(true)}>
          <FolderPlus className="mr-1 h-4 w-4" />
          New folder
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <FileUp className="mr-1 h-4 w-4" />
          Upload files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <Dialog open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" />
              New folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="folderName">Folder name</Label>
            <Input
              id="folderName"
              placeholder="My Images"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim() || creatingFolder}>
              {creatingFolder ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Delete the old form**

Run: `git rm components/FileUploadForm.tsx`

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for `components/FileUploadBanner.tsx`. (`FileList.tsx`/`DashboardContent.tsx` still reference the now-deleted `FileUploadForm` until Task 12 rewires them — that error is expected and filtered separately; if the grep shows a NEW "Cannot find module './FileUploadForm'" error, that's fine, it's the expected breakage waiting on Task 12. If in doubt, run plain `npx tsc --noEmit` and confirm the only new-looking error, beyond the already-known `@heroui` ones, is exactly that missing-module error.)

- [ ] **Step 4: Commit**

```bash
git add components/FileUploadBanner.tsx components/FileUploadForm.tsx
git commit -m "feat: replace upload card with drag-and-drop banner"
```

---

## Task 11: `components/DashboardSidebar.tsx` (new)

**Files:**
- Create: `components/DashboardSidebar.tsx`

**Interfaces:**
- Consumes: `Progress` (Task 2).
- Produces: `DashboardSidebar({ activeView, activeTab, allCount, starredCount, trashCount, storageUsedBytes, onSelectTab, onSelectProfile }: DashboardSidebarProps)`, consumed by `DashboardContent.tsx` in Task 12.

- [ ] **Step 1: Create `components/DashboardSidebar.tsx`**

```tsx
"use client";

import { File, Star, Trash, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type FileTab = "all" | "starred" | "trash";

interface DashboardSidebarProps {
  activeView: "files" | "profile";
  activeTab: FileTab;
  allCount: number;
  starredCount: number;
  trashCount: number;
  storageUsedBytes: number;
  onSelectTab: (tab: FileTab) => void;
  onSelectProfile: () => void;
}

const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

function formatGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(1);
}

export default function DashboardSidebar({
  activeView,
  activeTab,
  allCount,
  starredCount,
  trashCount,
  storageUsedBytes,
  onSelectTab,
  onSelectProfile,
}: DashboardSidebarProps) {
  const navItemClass = (active: boolean) =>
    `flex w-full items-center gap-2.5 rounded-full px-3.5 py-2.5 text-sm transition-colors ${
      active
        ? "bg-organic-accent-100 font-semibold text-organic-accent-800"
        : "text-foreground hover:bg-muted"
    }`;

  const isFilesTab = (tab: FileTab) => activeView === "files" && activeTab === tab;

  return (
    <aside className="flex w-[230px] flex-shrink-0 flex-col gap-1 border-r border-border p-3.5">
      <button className={navItemClass(isFilesTab("all"))} onClick={() => onSelectTab("all")}>
        <File className="h-[18px] w-[18px]" />
        <span>All Files</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">{allCount}</span>
      </button>
      <button className={navItemClass(isFilesTab("starred"))} onClick={() => onSelectTab("starred")}>
        <Star className="h-[18px] w-[18px]" />
        <span>Starred</span>
        <span className="ml-auto rounded-full bg-organic-accent-100 px-2 py-0.5 text-xs text-organic-accent-800">
          {starredCount}
        </span>
      </button>
      <button className={navItemClass(isFilesTab("trash"))} onClick={() => onSelectTab("trash")}>
        <Trash className="h-[18px] w-[18px]" />
        <span>Trash</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">{trashCount}</span>
      </button>

      <div className="my-2 border-t border-border" />

      <button className={navItemClass(activeView === "profile")} onClick={onSelectProfile}>
        <User className="h-[18px] w-[18px]" />
        <span>Profile</span>
      </button>

      <div className="mt-auto rounded-2xl bg-card p-3.5">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="font-semibold">Storage</span>
          <span className="text-muted-foreground">
            {formatGB(storageUsedBytes)} GB of {formatGB(STORAGE_QUOTA_BYTES)} GB
          </span>
        </div>
        <Progress value={(storageUsedBytes / STORAGE_QUOTA_BYTES) * 100} className="h-2" />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output for this file.

- [ ] **Step 3: Commit**

```bash
git add components/DashboardSidebar.tsx
git commit -m "feat: add dashboard sidebar navigation"
```

---

## Task 12: Dashboard data-flow rewrite — `DashboardContent.tsx` + `FileList.tsx`

This is the task where everything from Tasks 7–11 gets wired together. File-fetching and the star/trash/delete/download/create-folder/empty-trash handlers move from `FileList.tsx` up to `DashboardContent.tsx`, so `DashboardSidebar` (a sibling of `FileList`, not a child) can show live counts and the storage meter from the same data `FileList` renders. `FileList.tsx` becomes presentational: it receives `files` and the handlers as props instead of fetching/owning them itself. This also lets the upload banner live inside `FileList` (next to the data it needs — `currentFolder`) without threading an `onFolderChange` callback back up to `DashboardContent`, which the old `FileUploadForm`-in-`DashboardContent` layout required.

**Files:**
- Modify: `components/DashboardContent.tsx`, `components/FileList.tsx`, `app/dashboard/page.tsx`
- Delete: `components/FileTabs.tsx`, `components/FileActionButtons.tsx`

**Interfaces:**
- Produces (`FileList.tsx`):
  ```ts
  interface FileListProps {
    files: FileType[];
    loading: boolean;
    activeTab: "all" | "starred" | "trash";
    userId: string;
    onStar: (id: string) => void;
    onTrash: (id: string) => void;
    onDelete: (id: string) => void;
    onDownload: (file: FileType) => void;
    onRefresh: () => void;
    onEmptyTrash: () => void;
    onFolderChange: (folderId: string | null) => void;
  }
  ```
  `onFolderChange` here only tells `DashboardContent` which folder is open so it can pass the right `parentId` to its fetch — folder-path/breadcrumb state (`currentFolder`, `folderPath`) stays local to `FileList` since only `FileList`'s own rendering needs it.
- Produces (`DashboardContent.tsx`): renders `DashboardSidebar` (Task 11) with `allCount`/`starredCount`/`trashCount`/`storageUsedBytes` computed from its own `files` state, and `FileList` or `UserProfile` (Task 13) depending on `activeView`.

- [ ] **Step 1: Delete the two superseded components**

Run: `git rm components/FileTabs.tsx components/FileActionButtons.tsx`

- [ ] **Step 2: Rewrite `components/FileList.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, List, RefreshCw, Trash as TrashIcon, Star, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import type { File as FileType } from "@/lib/db/schema";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FileEmptyState from "@/components/FileEmptyState";
import FileIcon from "@/components/FileIcon";
import FileActions from "@/components/FileActions";
import FileLoadingState from "@/components/FileLoadingState";
import FileGrid from "@/components/FileGrid";
import FolderNavigation from "@/components/FolderNavigation";
import FileUploadBanner from "@/components/FileUploadBanner";

interface FileListProps {
  files: FileType[];
  loading: boolean;
  activeTab: "all" | "starred" | "trash";
  userId: string;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (file: FileType) => void;
  onRefresh: () => void;
  onEmptyTrash: () => void;
  onFolderChange: (folderId: string | null) => void;
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileList({
  files,
  loading,
  activeTab,
  userId,
  onStar,
  onTrash,
  onDelete,
  onDownload,
  onRefresh,
  onEmptyTrash,
  onFolderChange,
}: FileListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Switching sidebar tabs always exits whatever folder is open, matching the
  // mockup's behavior (see design spec, "Dashboard" section).
  useEffect(() => {
    setCurrentFolder(null);
    setFolderPath([]);
    onFolderChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const openImageViewer = (file: FileType) => {
    const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-90,w-1600,h-1200,fo-auto/${file.path}`;
    window.open(optimizedUrl, "_blank");
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);
    onFolderChange(folderId);
  };

  const navigateUp = () => {
    if (folderPath.length === 0) return;
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    setCurrentFolder(newFolderId);
    onFolderChange(newFolderId);
  };

  const navigateToPathFolder = (index: number) => {
    if (index < 0) {
      setCurrentFolder(null);
      setFolderPath([]);
      onFolderChange(null);
      return;
    }
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    const newFolderId = newPath[newPath.length - 1].id;
    setCurrentFolder(newFolderId);
    onFolderChange(newFolderId);
  };

  const handleOpen = (file: FileType) => {
    if (file.isFolder) navigateToFolder(file.id, file.name);
    else if (file.type.startsWith("image/")) openImageViewer(file);
  };

  const trashCount = files.filter((f) => f.isTrash).length;

  if (loading) return <FileLoadingState />;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="truncate text-3xl">
          {folderPath.length > 0
            ? folderPath[folderPath.length - 1].name
            : activeTab === "starred"
              ? "Starred Files"
              : activeTab === "trash"
                ? "Trash"
                : "All Files"}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
          {activeTab === "trash" && trashCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => setEmptyTrashModalOpen(true)}>
              <TrashIcon className="mr-1 h-4 w-4" />
              Empty trash
            </Button>
          )}
          <div className="flex overflow-hidden rounded-full border border-border">
            <button
              className={`px-2.5 py-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              className={`px-2.5 py-2 ${viewMode === "table" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setViewMode("table")}
              aria-label="Table view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {folderPath.length > 0 && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={navigateUp}
          navigateToPathFolder={navigateToPathFolder}
        />
      )}

      {activeTab === "all" && !currentFolder && (
        <FileUploadBanner userId={userId} onUploadSuccess={onRefresh} currentFolder={currentFolder} />
      )}

      {files.length === 0 ? (
        <FileEmptyState activeTab={currentFolder ? "all" : activeTab} />
      ) : viewMode === "grid" ? (
        <FileGrid
          files={files}
          onOpen={handleOpen}
          onStar={onStar}
          onTrash={onTrash}
          onDelete={(file) => {
            setSelectedFile(file);
            setDeleteModalOpen(true);
          }}
          onDownload={onDownload}
        />
      ) : (
        <div className="overflow-hidden rounded-[24px] bg-card shadow-organic-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden sm:table-cell">Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    className={file.isFolder || file.type.startsWith("image/") ? "cursor-pointer" : ""}
                    onClick={() => handleOpen(file)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileIcon file={file} />
                        <div>
                          <div className="flex items-center gap-2 font-medium">
                            <span className="max-w-[200px] truncate">{file.name}</span>
                            {file.isStarred && (
                              <Star className="h-3.5 w-3.5 fill-organic-accent text-organic-accent" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      {file.isFolder ? "Folder" : file.type}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {file.isFolder ? "-" : formatSize(file.size)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <FileActions
                        file={file}
                        onStar={onStar}
                        onTrash={onTrash}
                        onDelete={(f) => {
                          setSelectedFile(f);
                          setDeleteModalOpen(true);
                        }}
                        onDownload={onDownload}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete permanently?"
        description="Are you sure you want to permanently delete this file?"
        icon={X}
        confirmText="Delete permanently"
        onConfirm={() => selectedFile && onDelete(selectedFile.id)}
        isDangerous
        warningMessage={`You are about to permanently delete "${selectedFile?.name}". This file will be permanently removed from your account and cannot be recovered.`}
      />

      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty trash"
        description="Are you sure you want to empty the trash?"
        icon={Trash}
        confirmText="Empty trash"
        onConfirm={onEmptyTrash}
        isDangerous
        warningMessage={`You are about to permanently delete all ${trashCount} items in your trash. These files will be permanently removed from your account and cannot be recovered.`}
      />
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `components/DashboardContent.tsx`** — owns the fetch and every mutation handler, renders `DashboardSidebar` + (`FileList` or `UserProfile`)

```tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import type { File as FileType } from "@/lib/db/schema";
import DashboardSidebar from "@/components/DashboardSidebar";
import FileList from "@/components/FileList";
import UserProfile from "@/components/UserProfile";

interface DashboardContentProps {
  userId: string;
  userName: string;
}

type FileTab = "all" | "starred" | "trash";

export default function DashboardContent({ userId, userName }: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeView, setActiveView] = useState<"files" | "profile">(
    tabParam === "profile" ? "profile" : "files"
  );
  const [activeTab, setActiveTab] = useState<FileTab>("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveView(tabParam === "profile" ? "profile" : "files");
  }, [tabParam]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/files?userId=${userId}`;
      if (currentFolder) url += `&parentId=${currentFolder}`;
      const response = await axios.get(url);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("We couldn't load your files. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userId, currentFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filteredFiles = files.filter((file) => {
    if (activeTab === "starred") return file.isStarred && !file.isTrash;
    if (activeTab === "trash") return file.isTrash;
    return !file.isTrash;
  });

  const allCount = files.filter((f) => !f.isTrash).length;
  const starredCount = files.filter((f) => f.isStarred && !f.isTrash).length;
  const trashCount = files.filter((f) => f.isTrash).length;
  const storageUsedBytes = files
    .filter((f) => !f.isTrash && !f.isFolder)
    .reduce((sum, f) => sum + f.size, 0);

  const handleStar = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/star`);
      const file = files.find((f) => f.id === fileId);
      setFiles(files.map((f) => (f.id === fileId ? { ...f, isStarred: !f.isStarred } : f)));
      toast.success(
        file?.isStarred
          ? `"${file?.name}" removed from your starred files`
          : `"${file?.name}" added to your starred files`
      );
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("We couldn't update the star status. Please try again.");
    }
  };

  const handleTrash = async (fileId: string) => {
    try {
      const response = await axios.patch(`/api/files/${fileId}/trash`);
      const file = files.find((f) => f.id === fileId);
      setFiles(files.map((f) => (f.id === fileId ? { ...f, isTrash: !f.isTrash } : f)));
      toast.success(
        `"${file?.name}" has been ${response.data.isTrash ? "moved to trash" : "restored"}`
      );
    } catch (error) {
      console.error("Error trashing file:", error);
      toast.error("We couldn't update the file status. Please try again.");
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const fileToDelete = files.find((f) => f.id === fileId);
      const response = await axios.delete(`/api/files/${fileId}/delete`);
      if (response.data.success) {
        setFiles(files.filter((f) => f.id !== fileId));
        toast.success(`"${fileToDelete?.name || "File"}" has been permanently removed`);
      } else {
        throw new Error(response.data.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("We couldn't delete the file. Please try again later.");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await axios.delete(`/api/files/empty-trash`);
      setFiles(files.filter((f) => !f.isTrash));
      toast.success(`All ${trashCount} items have been permanently deleted`);
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("We couldn't empty the trash. Please try again later.");
    }
  };

  const handleDownload = async (file: FileType) => {
    try {
      const downloadUrl = file.type.startsWith("image/")
        ? `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`
        : file.fileUrl;

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success(`"${file.name}" is ready to download.`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("We couldn't download the file. Please try again later.");
    }
  };

  const selectTab = (tab: FileTab) => {
    setActiveView("files");
    setActiveTab(tab);
    setCurrentFolder(null);
    setMobileSidebarOpen(false);
  };

  const selectProfile = () => {
    setActiveView("profile");
    setMobileSidebarOpen(false);
  };

  return (
    <div className="relative flex flex-1">
      <button
        className="mb-3 flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm md:hidden"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-organic-text/20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 bg-background transition-transform md:static md:z-auto md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardSidebar
          activeView={activeView}
          activeTab={activeTab}
          allCount={allCount}
          starredCount={starredCount}
          trashCount={trashCount}
          storageUsedBytes={storageUsedBytes}
          onSelectTab={selectTab}
          onSelectProfile={selectProfile}
        />
      </div>

      <main className="flex-1 px-4 py-2 md:px-8 md:py-4">
        {activeView === "files" ? (
          <FileList
            files={filteredFiles}
            loading={loading}
            activeTab={activeTab}
            userId={userId}
            onStar={handleStar}
            onTrash={handleTrash}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onRefresh={fetchFiles}
            onEmptyTrash={handleEmptyTrash}
            onFolderChange={setCurrentFolder}
          />
        ) : (
          <UserProfile />
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Update `app/dashboard/page.tsx`** to give `DashboardContent` a flex row to lay out into (sidebar + main)

```tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import Navbar from "@/components/Navbar";

export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const serializedUser = user
    ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        username: user.username,
        emailAddress: user.emailAddresses?.[0]?.emailAddress,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={serializedUser} />
      <div className="flex flex-1 flex-col">
        <DashboardContent
          userId={userId}
          userName={
            user?.firstName ||
            user?.fullName ||
            user?.emailAddresses?.[0]?.emailAddress ||
            ""
          }
        />
      </div>
    </div>
  );
}
```

(`userName` is still computed and passed through even though the new sidebar-based dashboard doesn't render a "Hi, {name}" greeting the way the old tab layout did — the mockup doesn't have one either. `DashboardContent` keeps accepting the prop rather than the call site dropping it, since `UserProfile`, rendered inside `DashboardContent`, already shows the user's name via its own Clerk hook — no functionality is lost.)

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output referencing `FileList.tsx`, `DashboardContent.tsx`, or `app/dashboard/page.tsx`. (`UserProfile.tsx` still fails until Task 13 — filtered separately the same way.)

Run: `npm run dev`, sign in, open `/dashboard`.
Expected: sidebar renders with live All Files/Starred/Trash counts and a storage bar; clicking each nav item filters the list; the upload banner appears above "All Files" at the root and accepts drag-and-drop and click-to-browse uploads (both update the sidebar counts/storage bar immediately after upload); the grid/table toggle switches views; opening a folder shows the breadcrumb and hides the upload banner; star/trash/restore/permanently-delete/empty-trash all work and show toasts; on a narrow viewport, the sidebar collapses behind the "Menu" button.

- [ ] **Step 6: Commit**

```bash
git add components/FileList.tsx components/DashboardContent.tsx app/dashboard/page.tsx components/FileTabs.tsx components/FileActionButtons.tsx
git commit -m "feat: restructure dashboard to sidebar layout with shared file state"
```

---

## Task 13: Restyle `components/UserProfile.tsx`

**Files:**
- Modify: `components/UserProfile.tsx`

**Interfaces:**
- Consumes: `Card`/`CardContent`, `Avatar`/`AvatarImage`/`AvatarFallback`, `Button`, `Badge` (the existing custom one in `components/ui/Badge.tsx`, unchanged) (Task 2 + existing).
- Keeps the exact same `useUser`/`useClerk` data source and `handleSignOut` behavior; no props (unchanged).

- [ ] **Step 1: Rewrite `components/UserProfile.tsx`**

```tsx
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { Loader2, Mail, User, ArrowRight } from "lucide-react";

export default function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="mx-auto max-w-md border-none shadow-organic-sm">
        <CardContent className="py-10 text-center">
          <Avatar className="mx-auto mb-4 h-16 w-16">
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-medium">Not signed in</p>
          <p className="mt-2 text-muted-foreground">Please sign in to access your profile</p>
          <Button className="mt-6" onClick={() => router.push("/sign-in")}>
            Sign in
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const email = user.primaryEmailAddress?.emailAddress || "";
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const isVerified = user.emailAddresses?.[0]?.verification?.status === "verified";

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-3xl">Profile</h1>
      <Card className="border-none shadow-organic-sm">
        <CardContent className="flex flex-col items-center gap-4 py-7 text-center">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarImage src={user.imageUrl} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3>{fullName}</h3>
            {email && (
              <div className="mt-1 flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </div>
            )}
          </div>

          <div className="my-1 h-px w-full bg-border" />

          <div className="flex w-full justify-between">
            <span className="text-sm font-semibold">Account status</span>
            <Badge color="secondary" variant="flat">Active</Badge>
          </div>
          <div className="flex w-full justify-between">
            <span className="text-sm font-semibold">Email verification</span>
            <Badge color="secondary" variant="flat">{isVerified ? "Verified" : "Pending"}</Badge>
          </div>

          <div className="my-1 h-px w-full bg-border" />

          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

`components/ui/Badge.tsx` doesn't define a `"secondary"` color option today (only `default|primary|secondary|success|warning|danger`) — `"secondary"` is already one of its accepted values, so no change is needed there; it renders using its existing `bg-secondary-100 text-secondary-800` Tailwind classes, which now resolve through the new `--secondary`/`--muted` tokens from Task 1.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -v "@heroui"`
Expected: no output at all — this should be the first point where the whole-program grep is completely silent, since every `@heroui`-importing file has now been migrated.

Run: `npm run dev`, open `/dashboard`, click "Profile" in the sidebar.
Expected: centered profile card renders — avatar, name, email, Account status/Email verification tags, sign-out button (which signs out and redirects to `/`).

- [ ] **Step 3: Commit**

```bash
git add components/UserProfile.tsx
git commit -m "feat: restyle user profile with shadcn/ui"
```

---

## Task 14: Final cleanup and whole-repo verification

**Files:**
- Modify: `package.json` (only if Step 1 finds leftovers)

**Interfaces:** none — this task only removes dead weight and runs the repo-wide gate.

- [ ] **Step 1: Confirm nothing still references HeroUI or next-themes**

Run: `grep -rn "@heroui\|next-themes" app components lib --include="*.tsx" --include="*.ts" 2>/dev/null`
Expected: no output. If anything shows up, fix that file before continuing (it means an earlier task's migration was incomplete).

- [ ] **Step 2: Prune now-unused transitive deps**

Run: `grep -rn "framer-motion\|intl-messageformat\|@react-aria\|@react-types\|tailwind-variants" app components lib --include="*.tsx" --include="*.ts" 2>/dev/null`
Expected: no output (confirmed already in Task 1's investigation, but re-check here since it's cheap and this is the last chance to catch drift).

If clean, remove `framer-motion` and `intl-messageformat` from `package.json` `dependencies` (they were HeroUI-only transitive deps that `npm install` may have kept around since they were explicitly listed), then run `npm install` again.

- [ ] **Step 3: Whole-repo build**

Run: `npm run build`
Expected: succeeds with no type errors and no missing-module errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no new errors (pre-existing warnings unrelated to this migration, if any, are out of scope).

- [ ] **Step 5: Full manual walkthrough**

Run: `npm run dev` and check, in order: `/` (landing, signed-out CTAs), `/sign-in` and `/sign-up` (including the sign-up verification-code step), `/dashboard` (upload via drag-drop and via the button, new folder, star/unstar, move to trash, restore, permanently delete, empty trash, grid/table toggle, folder navigation breadcrumb, storage meter updates), the user dropdown from the top nav (Profile / My files / Sign out), and the mobile nav/sidebar drawers at a narrow viewport width.
Expected: everything above works with no console errors and no HeroUI-styled remnants (no default blue buttons, no leftover heroui class names).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: finish HeroUI removal and verify full build"
```
