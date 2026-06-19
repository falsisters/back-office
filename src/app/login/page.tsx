import LoginForm from "@/components/Login/LoginForm";
import { AuthGate } from "@/components/AuthGate";

export default function LoginPage() {
  return (
    <AuthGate requireAuth={false}>
      <div className="container mx-auto p-4">
        <LoginForm />
      </div>
    </AuthGate>
  );
}
