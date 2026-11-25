import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-brand-800 lg:block">
        <Image src="/images/clinic/hero-reception-900.webp" alt="" fill priority sizes="55vw" className="object-cover opacity-35 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-900/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <p className="font-display text-[2.75rem] leading-[1.1] font-semibold">Derma World Skin &amp; Hair Clinic</p>
          <p className="mt-4 max-w-md text-lg text-brand-100">Appointments, patient messages and website content for the clinic in Moula Ali.</p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-sage-50 px-5 py-12">
        <div className="w-full max-w-md">
          <Image src="/images/brand/logo-navbar.webp" alt="Derma World" width={733} height={112} className="h-10 w-auto" priority />
          <h1 className="mt-10 text-[2.25rem] leading-tight font-semibold">Sign in to the admin</h1>
          <p className="mt-2 text-sage-600">For clinic staff only. Use the email your account was set up with.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
