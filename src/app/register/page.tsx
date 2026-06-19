import RegisterForm from "@/components/Register/RegisterForm";
import { AuthGate } from "@/components/AuthGate";

export default function RegisterPage() {
  return (
    <AuthGate requireAuth={false}>
      <div className="container mx-auto p-4">
        <RegisterForm />
      </div>
    </AuthGate>
  );
}
