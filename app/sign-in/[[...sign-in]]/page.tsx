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
