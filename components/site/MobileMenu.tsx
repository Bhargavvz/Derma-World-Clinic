"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NavLinks } from "./NavLinks";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileMenu({ items, hours }: { items: { href: string; label: string }[]; hours: string }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="btn-secondary !px-3 lg:hidden"
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
        aria-controls="mobile-menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-950/40" />
        <Dialog.Content
          id="mobile-menu"
          className="fixed inset-y-0 right-0 z-50 flex w-[86vw] max-w-sm flex-col gap-6 overflow-y-auto bg-white p-6 shadow-xl animate-fade-up"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-xl text-brand-900">{t("nav.menu")}</Dialog.Title>
            <Dialog.Close className="btn-secondary !px-3" aria-label={t("nav.closeMenu")}>
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{t("nav.primary")}</Dialog.Description>
          <nav aria-label={t("nav.primary")}>
            <NavLinks items={items} vertical onNavigate={() => setOpen(false)} />
          </nav>
          <Link href="/appointment" className="btn-primary" onClick={() => setOpen(false)}>
            {t("common.bookAppointment")}
          </Link>
          <p className="text-sm text-gray-600">{hours}</p>
          <LanguageSwitcher />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
