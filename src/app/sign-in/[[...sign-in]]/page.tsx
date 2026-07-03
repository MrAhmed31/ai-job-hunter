import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
      <SignIn />
    </div>
  );
}
