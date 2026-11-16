import type { Metadata } from "next";
import { ChatApp } from "@/components/chat/ChatApp";
import { siteConfig } from "@/config/site";
import { getChatLimits, getOpenRouterConfig, isOpenRouterReady } from "@/lib/server/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Assistant",
  description: `Tanya jawab seputar Pendidikan Agama Islam bersama ${siteConfig.APP_NAME}.`,
};

type PageProps = { searchParams: Promise<{ q?: string | string[] }> };

export default async function AssistantPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const question = typeof params.q === "string" ? params.q : "";
  const limits = getChatLimits();

  return (
    <main id="konten" className="chat-main">
      <ChatApp
        aiReady={isOpenRouterReady(getOpenRouterConfig())}
        maxInputChars={limits.maxInputChars}
        initialQuestion={question}
        showSetupHint={process.env.NODE_ENV !== "production"}
      />
    </main>
  );
}
