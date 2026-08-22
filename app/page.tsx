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
