import { SignIn } from "@clerk/nextjs";
import { Ghost } from "lucide-react";
import { AuthPanel } from "@/components/auth/auth-panel";

export default function SignInPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <AuthPanel />

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12 sm:px-12 bg-base">
        {/* Mobile-only logo */}
        <div className="flex lg:hidden items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary-dim border border-border-subtle">
            <Ghost className="h-4 w-4 text-accent-primary" />
          </div>
          <span className="text-base font-bold text-text-primary tracking-tight">
            Ghost<span className="text-accent-primary">AI</span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
