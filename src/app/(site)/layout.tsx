import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="konten" className="site-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
