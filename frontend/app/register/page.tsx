import AuthForm from "@/app/_components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16">
      <AuthForm mode="register" />
    </div>
  );
}
