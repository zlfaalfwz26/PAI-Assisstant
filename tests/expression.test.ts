import { describe, expect, it } from "vitest";
import { expressionForReply } from "@/lib/chat/expression";

describe("expressionForReply", () => {
  it("SUPPORTIVE saat pengguna tampak bingung/cemas", () => {
    expect(expressionForReply("Saya bingung memilih jurusan", "Tenang, kita bahas bersama.")).toBe("supportive");
  });

  it("APOLOGETIC saat data resmi belum tersedia", () => {
    expect(expressionForReply("Berapa biaya kuliah?", "Mohon maaf, informasi biaya belum tersedia di PAI Assistant.")).toBe(
      "apologetic",
    );
  });

  it("CONFUSED saat asisten meminta klarifikasi", () => {
    expect(expressionForReply("itu gimana", "Boleh dijelaskan lebih spesifik, apa yang kamu maksud?")).toBe("confused");
  });

  it("HAPPY untuk jawaban biasa", () => {
    expect(expressionForReply("Apa itu akhlak?", "Akhlak adalah perilaku yang tertanam dalam diri.")).toBe("happy");
  });
});
