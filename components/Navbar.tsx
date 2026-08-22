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
      className={`sticky top-0 z-50 bg-background backdrop-blur transition-shadow ${
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
            className="fixed inset-0 z-40 bg-organic-neutral-900 opacity-20 md:hidden"
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
