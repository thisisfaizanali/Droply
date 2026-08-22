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
