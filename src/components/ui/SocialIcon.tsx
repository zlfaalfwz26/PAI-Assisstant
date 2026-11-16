import { Globe, Mail, MessageCircle } from "lucide-react";
import type { SocialPlatform } from "@/config/site";

/** Ikon media sosial sederhana (monokrom, mengikuti currentColor). */
export function SocialIcon({ platform, size = 18 }: { platform: SocialPlatform; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (platform) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="M10.5 9.5v5l4.2-2.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14.5 8H17V4.5h-2.6C11.9 4.5 10.5 6 10.5 8.6V11H8v3.5h2.5V21H14v-6.5h2.6l.4-3.5h-3V9c0-.6.3-1 .5-1z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3.5" />
          <path d="M8 10.5V16M8 7.6v.1M11.5 16v-3.2c0-1.4.9-2.3 2.1-2.3s1.9.8 1.9 2.3V16M11.5 10.5V16" />
        </svg>
      );
    case "whatsapp":
      return <MessageCircle size={size} strokeWidth={1.9} aria-hidden="true" />;
    case "email":
      return <Mail size={size} strokeWidth={1.9} aria-hidden="true" />;
    case "website":
    default:
      return <Globe size={size} strokeWidth={1.9} aria-hidden="true" />;
  }
}
