import BrandHeader from "@/components/BrandHeader";
import SignupForm from "@/components/SignupForm";
import { brand } from "@/lib/config/brand";

export default function SignupPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: brand.backgroundColor }}>
      <BrandHeader />
      <SignupForm />
    </div>
  );
}
