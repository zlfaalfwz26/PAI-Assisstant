import { Hero } from "@/components/landing/Hero";
import { Intro } from "@/components/landing/Intro";
import { PaiInfo } from "@/components/landing/PaiInfo";
import { Features } from "@/components/landing/Features";
import { CtaBand } from "@/components/landing/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <PaiInfo />
      <Features />
      <CtaBand />
    </>
  );
}
