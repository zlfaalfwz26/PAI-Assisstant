import type { Metadata } from "next";
import { siteConfig, type TeamMember } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SocialIcon } from "@/components/ui/SocialIcon";
import styles from "./tim.module.css";

export const metadata: Metadata = {
  title: "Tim",
  description: `Orang-orang di balik ${siteConfig.APP_NAME} dan ${siteConfig.HMJ_NAME}.`,
};

export default function TeamPage() {
  const members = siteConfig.TEAM_MEMBERS.filter((member) => member.name.trim());

  return (
    <>
      <PageHeader
        kicker="Tim"
        title="Tim Kami"
        lead={`Orang-orang di balik ${siteConfig.APP_NAME} dan ${siteConfig.HMJ_NAME}.`}
      />
      <section className="section" aria-label="Daftar anggota tim">
        <div className="container">
          {members.length > 0 ? (
            <ul className={styles.grid}>
              {members.map((member) => (
                <MemberCard key={`${member.name}-${member.role}`} member={member} />
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Daftar tim belum ditambahkan"
              description="Profil pengurus dan tim pengembang akan ditampilkan di sini setelah datanya diperbarui."
              devHint="isi TEAM_MEMBERS di src/config/site.ts (nama, peran, foto opsional)."
            />
          )}
        </div>
      </section>
    </>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <li className={`card ${styles.member}`}>
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.photo} src={member.photo} alt={`Foto ${member.name}`} loading="lazy" />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
      )}
      <div className={styles.info}>
        <p className={styles.name}>{member.name}</p>
        <p className={styles.role}>{member.role}</p>
        {member.division && <p className={styles.division}>{member.division}</p>}
      </div>
      {(member.instagram || member.linkedin) && (
        <div className={styles.links}>
          {member.instagram && (
            <a
              href={member.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${member.name}`}
            >
              <SocialIcon platform="instagram" size={17} />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn ${member.name}`}>
              <SocialIcon platform="linkedin" size={17} />
            </a>
          )}
        </div>
      )}
    </li>
  );
}
