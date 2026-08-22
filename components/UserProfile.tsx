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
