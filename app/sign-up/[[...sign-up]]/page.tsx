import { SignUp } from "@clerk/nextjs";
import { Ghost } from "lucide-react";
import { AuthPanel } from "@/components/auth/auth-panel";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen overflow-auto bg-base">
      <AuthPanel />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-base px-6 py-12 sm:px-12">
        <div className="flex lg:hidden items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary-dim border border-border-subtle">
            <Ghost className="h-4 w-4 text-accent-primary" />
          </div>
          <span className="text-base font-bold text-text-primary">
            Ghost<span className="text-accent-primary">AI</span>
          </span>
        </div>

        <div className="w-full max-w-sm rounded-3xl bg-surface p-2 shadow-[var(--shadow-soft)]">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
