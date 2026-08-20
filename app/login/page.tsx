import BrandHeader from "@/components/BrandHeader";
import LoginForm from "@/components/LoginForm";
import { brand } from "@/lib/config/brand";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen" style={{ backgroundColor: brand.backgroundColor }}>
      <BrandHeader />
      <LoginForm confirmError={error === "confirm"} />
    </div>
  );
}
