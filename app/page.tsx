import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  CloudUpload,
  Shield,
  Folder,
  ArrowRight,
  Star,
  FileText,
  Image as ImageIcon,
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
                Your images and PDFs, kept somewhere nicer.
              </h1>
              <p className="mt-4 max-w-md text-lg text-muted-foreground">
                Droply is a quiet place to drop your photos, PDFs, and files —
                organized, private, and yours alone. No clutter, no noise.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button size="lg" className="transition-transform hover:scale-[1.03]">
                      Get started free
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button size="lg" variant="outline">Sign in</Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg" className="transition-transform hover:scale-[1.03]">
                      Go to Dashboard
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-organic-sm">
                  <ImageIcon className="h-3.5 w-3.5 text-organic-accent-600" />
                  Photos
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-organic-sm">
                  <FileText className="h-3.5 w-3.5 text-organic-accent2-700" />
                  PDFs
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-organic-sm">
                  <Folder className="h-3.5 w-3.5 text-organic-accent-700" />
                  Folders
                </span>
              </div>
            </div>

            <div className="relative order-first aspect-square overflow-hidden rounded-[28px] bg-organic-accent2-100 lg:order-last">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-organic-accent-100 blur-3xl" />

                {/* grounding shadow */}
                <div className="absolute bottom-10 h-6 w-44 rounded-full bg-organic-neutral-900/10 blur-xl md:bottom-12 md:w-56" />

                {/* back card: a document peeking out */}
                <div
                  className="absolute h-40 w-40 rounded-3xl bg-organic-accent-200 shadow-organic-md md:h-52 md:w-52"
                  style={{ transform: "translate(-50px, -34px) rotate(-14deg)" }}
                />
                {/* middle card */}
                <div
                  className="absolute h-40 w-40 rounded-3xl bg-organic-accent2-300 shadow-organic-md md:h-52 md:w-52"
                  style={{ transform: "translate(46px, 26px) rotate(11deg)" }}
                />

                {/* front card: a little illustrated "photo", drifting gently */}
                <div
                  className="animate-drift relative h-44 w-44 md:h-56 md:w-56"
                  style={{ ["--drift-rotate" as string]: "-3deg", animationFillMode: "backwards" }}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-3xl bg-organic-neutral-100 shadow-organic-lg">
                    <div className="absolute inset-0 bg-gradient-to-b from-organic-accent-100 to-organic-accent2-100" />
                    <div className="absolute right-6 top-6 h-8 w-8 rounded-full bg-organic-accent-400 md:right-8 md:top-8 md:h-10 md:w-10" />
                    <div className="absolute left-7 top-9 h-4 w-10 rounded-full bg-white/50 md:left-9 md:top-11 md:h-5 md:w-12" />
                    <div className="absolute left-11 top-12 h-3 w-7 rounded-full bg-white/40 md:left-14 md:top-[3.75rem] md:h-3.5 md:w-9" />
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/2 bg-organic-accent2-500"
                      style={{
                        clipPath:
                          "polygon(0% 100%, 22% 45%, 45% 68%, 68% 25%, 85% 55%, 100% 40%, 100% 100%)",
                      }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/3 bg-organic-accent2-700"
                      style={{
                        clipPath: "polygon(0% 100%, 35% 55%, 60% 80%, 100% 50%, 100% 100%)",
                      }}
                    />
                  </div>

                  <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-organic-accent-500 shadow-organic-sm ring-4 ring-organic-accent2-100">
                    <Star className="h-5 w-5 fill-white text-white" />
                  </div>
                </div>

                {/* a small pdf, tucked beside the stack — also drifting, slightly out of sync */}
                <div
                  className="animate-drift absolute bottom-8 left-8 flex h-16 w-14 items-center justify-center rounded-2xl bg-organic-neutral-100 shadow-organic-md md:bottom-10 md:left-12 md:h-20 md:w-16"
                  style={{
                    ["--drift-rotate" as string]: "-8deg",
                    animationDelay: "0.6s",
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="absolute inset-x-3 top-3 h-1 rounded-full bg-organic-accent2-500 md:inset-x-4" />
                  <FileText className="h-6 w-6 text-organic-accent2-700 md:h-7 md:w-7" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 py-14">
          <h2 className="max-w-md">Everything your files need, nothing they don't</h2>
          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <Card className="border-none shadow-organic-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-organic-md">
              <CardContent className="p-7">
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-organic-accent-100">
                  <CloudUpload className="h-[22px] w-[22px] text-organic-accent-700" />
                </div>
                <h3 className="mt-2 text-lg">Quick uploads</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Drag, drop, done. Photos and PDFs land where you left off.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-organic-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-organic-md">
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

            <Card className="border-none shadow-organic-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-organic-md sm:col-span-2 md:col-span-1">
              <CardContent className="p-7">
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-organic-accent-100">
                  <Shield className="h-[22px] w-[22px] text-organic-accent-700" />
                </div>
                <h3 className="mt-2 text-lg">Locked down</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Private by default. Your files, your eyes only.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="relative mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-6 overflow-hidden rounded-[28px] bg-organic-accent2-100 px-8 py-12 sm:flex-row">
            <div className="pointer-events-none absolute -left-10 -top-16 h-36 w-36 rounded-full bg-organic-accent2-300 opacity-50" />
            <div className="pointer-events-none absolute bottom-[-70px] left-40 h-24 w-24 rounded-full bg-organic-accent-300 opacity-40" />
            <Star
              className="pointer-events-none absolute right-16 top-8 h-5 w-5 rotate-12 text-organic-accent-400 opacity-70 md:right-24"
              aria-hidden="true"
            />
            <FileText
              className="pointer-events-none absolute bottom-10 right-10 h-6 w-6 -rotate-6 text-organic-accent2-600 opacity-60 md:right-16"
              aria-hidden="true"
            />
            <h2 className="relative max-w-md text-center sm:text-left">Ready when you are.</h2>
            <SignedOut>
              <Link href="/sign-up" className="relative">
                <Button size="lg" className="transition-transform hover:scale-[1.03]">
                  Let's go
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="relative">
                <Button size="lg" className="transition-transform hover:scale-[1.03]">
                  Dashboard
                </Button>
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
