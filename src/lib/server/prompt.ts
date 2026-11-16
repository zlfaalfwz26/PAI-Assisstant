import "server-only";
import { siteConfig } from "@/config/site";
import { ASSISTANT_RULES } from "@/config/assistant";
import type { KnowledgeEntry } from "./knowledge";

/** Kumpulkan data resmi dari konfigurasi publik (hanya bagian yang sudah diisi). */
export function configContext(): string[] {
  const lines: string[] = [];
  const s = siteConfig;
  if (s.INSTITUTION_NAME) lines.push(`Nama lembaga: ${s.INSTITUTION_NAME}`);
  lines.push(`Jurusan: ${s.DEPARTMENT_NAME} (${s.DEPARTMENT_SHORT_NAME})`);
  lines.push(`Organisasi mahasiswa: ${s.HMJ_FULL_NAME} (${s.HMJ_NAME})`);
  if (s.PAI_VISION.trim()) lines.push(`Visi resmi jurusan: ${s.PAI_VISION.trim()}`);
  const missions = s.PAI_MISSION.map((item) => item.trim()).filter(Boolean);
  if (missions.length) lines.push(`Misi resmi jurusan:\n${missions.map((m, i) => `${i + 1}. ${m}`).join("\n")}`);
  const about = s.HMJ_ABOUT.map((item) => item.trim()).filter(Boolean);
  if (about.length) lines.push(`Tentang ${s.HMJ_NAME}: ${about.join(" ")}`);
  const team = s.TEAM_MEMBERS.filter((member) => member.name.trim());
  if (team.length) {
    lines.push(
      `Tim/pengurus:\n${team.map((m) => `- ${m.name} — ${m.role}${m.division ? ` (${m.division})` : ""}`).join("\n")}`,
    );
  }
  const contacts = [
    ...s.SOCIAL_LINKS.filter((item) => item.url).map((item) => `${item.platform}: ${item.label} (${item.url})`),
    ...(s.CONTACT_EMAIL ? [`email: ${s.CONTACT_EMAIL}`] : []),
  ];
  if (contacts.length) lines.push(`Kontak resmi:\n${contacts.map((c) => `- ${c}`).join("\n")}`);
  return lines;
}

export function buildSystemPrompt(knowledge: KnowledgeEntry[]): string {
  const official = configContext();
  const knowledgeBlock = knowledge.length
    ? knowledge
        .map((entry) => `### ${entry.title}${entry.category ? ` [${entry.category}]` : ""}\n${entry.content}`)
        .join("\n\n")
    : "";

  return [
    `Kamu adalah ${siteConfig.APP_NAME}, asisten AI milik ${siteConfig.HMJ_NAME} untuk ${siteConfig.DEPARTMENT_NAME}. ` +
      "Peranmu: teman berdiskusi yang ramah, sopan, dan informatif bagi calon mahasiswa, mahasiswa, dan masyarakat umum yang ingin mengenal dunia Pendidikan Agama Islam (PAI).",
    ASSISTANT_RULES,
    "KONTEKS RESMI (satu-satunya sumber untuk informasi spesifik jurusan):",
    official.join("\n"),
    knowledgeBlock
      ? `Basis pengetahuan resmi dari pengurus:\n\n${knowledgeBlock}`
      : "Basis pengetahuan resmi dari pengurus: (belum ada data yang dimasukkan)",
  ].join("\n\n");
}
