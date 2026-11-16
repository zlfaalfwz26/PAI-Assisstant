import { describe, expect, it } from "vitest";
import { pickGreetings, pickIndex } from "@/lib/greetings";
import { siteConfig } from "@/config/site";

/** Generator acak deterministik untuk pengujian. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("pickIndex", () => {
  it("menghindari indeks yang dilarang bila ada pilihan lain", () => {
    for (let i = 0; i < 200; i++) expect(pickIndex(3, [1], seeded(i))).not.toBe(1);
  });

  it("tetap mengembalikan indeks valid bila semua dilarang", () => {
    expect(pickIndex(1, [0], seeded(1))).toBe(0);
  });

  it("mengembalikan -1 untuk daftar kosong", () => {
    expect(pickIndex(0, [], seeded(1))).toBe(-1);
  });
});

describe("pickGreetings", () => {
  const male = siteConfig.WELCOME_GREETINGS_MALE;
  const female = siteConfig.WELCOME_GREETINGS_FEMALE;

  it("memakai daftar terpisah dan indeks yang valid", () => {
    const pick = pickGreetings(male, female, null, seeded(7));
    expect(male[pick.male]).toBeTypeOf("string");
    expect(female[pick.female]).toBeTypeOf("string");
  });

  it("tidak mengulang sapaan kunjungan sebelumnya", () => {
    for (let seed = 0; seed < 300; seed++) {
      const previous = { male: seed % male.length, female: seed % female.length };
      const pick = pickGreetings(male, female, previous, seeded(seed));
      expect(pick.male).not.toBe(previous.male);
      expect(pick.female).not.toBe(previous.female);
    }
  });

  it("kedua karakter tidak pernah mengucapkan kalimat yang sama", () => {
    const shared = ["Halo!", "Ada yang bisa dibantu?"];
    for (let seed = 0; seed < 300; seed++) {
      const pick = pickGreetings(shared, [...shared, "Yuk, tanya!"], null, seeded(seed));
      expect(shared[pick.male]).not.toBe([...shared, "Yuk, tanya!"][pick.female]);
    }
  });

  it("menghasilkan variasi saat dimuat berulang", () => {
    const seen = new Set<string>();
    let previous = null as null | { male: number; female: number };
    for (let seed = 0; seed < 40; seed++) {
      const pick = pickGreetings(male, female, previous, seeded(seed * 31 + 5));
      seen.add(`${pick.male}-${pick.female}`);
      previous = pick;
    }
    expect(seen.size).toBeGreaterThan(10);
  });
});
