export const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/tim", label: "Tim" },
  { href: "/tentang", label: "Tentang HMJ PAI" },
] as const;

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
