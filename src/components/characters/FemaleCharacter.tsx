import { P } from "./palette";
import styles from "./characters.module.css";

/**
 * Karakter perempuan berhijab hijau — ilustrasi SVG bergaya 3D lembut.
 * Proporsi, gaya mata, dan warna hijau sama dengan karakter laki-laki
 * agar keduanya terasa satu keluarga visual.
 */

export const FEMALE_VIEWBOX = {
  half: "0 20 320 400",
  bust: "62 38 172 200",
} as const;

const HIJAB =
  "M148 52C192 52 222 86 222 128C222 158 214 178 212 198C222 210 238 226 246 248C252 266 252 290 244 306C232 330 196 348 148 352C100 348 64 330 52 306C44 290 44 266 50 248C58 226 74 210 84 198C82 178 74 158 74 128C74 86 104 52 148 52Z";
const FACE = "M148 70C183 70 206 96 206 131C206 164 186 192 148 199C110 192 90 164 90 131C90 96 113 70 148 70Z";
const OPENING = "M148 77C180 77 201 100 201 131C201 160 182 187 148 193C114 187 95 160 95 131C95 100 116 77 148 77Z";
/** Lilitan pashmina yang menyilang dari dagu ke bahu kiri. */
const WRAP = "M202 182C194 212 160 236 104 252C88 257 72 264 58 276C62 258 78 244 98 236C146 220 180 204 196 176Z";
const TUNIC =
  "M128 212C106 220 92 228 84 246C76 262 72 300 70 420H226C224 300 220 262 212 246C204 228 190 220 168 212Z";
const HAND =
  "M271 253C277 239 278 214 275 200C272 187 247 185 244 198L242 222C238 215 231 211 227 215C223 220 227 231 235 239C239 244 242 249 244 255Z";
const FOREARM = "M265 337C273 312 275 284 271 257L245 253C243 281 236 307 226 335C232 349 257 351 265 337Z";
const MOUTH_HAPPY = "M133 164Q148 168.5 163 164Q161.5 184 148 184Q134.5 184 133 164Z";

export function FemaleCharacter({ uid, crop = "half" }: { uid: string; crop?: keyof typeof FEMALE_VIEWBOX }) {
  const id = (name: string) => `${uid}-f-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg
      className={styles.svg}
      viewBox={FEMALE_VIEWBOX[crop]}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id("hijab")} x1="70" y1="46" x2="236" y2="366" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.highlight} />
          <stop offset="0.28" stopColor={P.green.light} />
          <stop offset="0.65" stopColor={P.green.base} />
          <stop offset="1" stopColor={P.green.shadow} />
        </linearGradient>
        <radialGradient id={id("hijabHi")} cx="122" cy="80" r="110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("hijabSide")} x1="150" y1="0" x2="244" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.deep} stopOpacity="0" />
          <stop offset="1" stopColor={P.green.deep} stopOpacity="0.34" />
        </linearGradient>
        <linearGradient id={id("wrap")} x1="200" y1="176" x2="60" y2="276" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.base} />
          <stop offset="0.5" stopColor={P.green.light} />
          <stop offset="1" stopColor={P.green.base} />
        </linearGradient>
        <radialGradient id={id("chinShadow")} cx="0.5" cy="0.3" r="0.6">
          <stop offset="0" stopColor={P.green.deep} stopOpacity="0.5" />
          <stop offset="1" stopColor={P.green.deep} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("tunic")} x1="70" y1="220" x2="226" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.cream.highlight} />
          <stop offset="0.55" stopColor={P.cream.base} />
          <stop offset="1" stopColor={P.cream.shadow} />
        </linearGradient>
        <linearGradient id={id("sleeve")} x1="196" y1="236" x2="262" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.cream.base} />
          <stop offset="1" stopColor={P.cream.shadow} />
        </linearGradient>
        <linearGradient id={id("forearm")} x1="274" y1="250" x2="224" y2="346" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.cream.highlight} />
          <stop offset="0.5" stopColor={P.cream.base} />
          <stop offset="1" stopColor={P.cream.shadow} />
        </linearGradient>
        <radialGradient id={id("face")} cx="134" cy="112" r="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.skin.highlight} />
          <stop offset="0.5" stopColor={P.skin.light} />
          <stop offset="1" stopColor={P.skin.shadow} />
        </radialGradient>
        <linearGradient id={id("faceShade")} x1="98" y1="0" x2="199" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.skin.deep} stopOpacity="0.06" />
          <stop offset="0.55" stopColor={P.skin.deep} stopOpacity="0" />
          <stop offset="1" stopColor={P.skin.deep} stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id={id("hand")} cx="0.64" cy="0.3" r="0.9">
          <stop offset="0" stopColor={P.skin.highlight} />
          <stop offset="0.55" stopColor={P.skin.light} />
          <stop offset="1" stopColor={P.skin.shadow} />
        </radialGradient>
        <radialGradient id={id("blush")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.blush} stopOpacity="0.62" />
          <stop offset="1" stopColor={P.blush} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("eye")} cx="0.42" cy="0.36" r="0.72">
          <stop offset="0" stopColor="#6a4430" />
          <stop offset="0.55" stopColor={P.eye.iris} />
          <stop offset="1" stopColor={P.eye.pupil} />
        </radialGradient>
        <radialGradient id={id("pearl")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9e2ec" />
        </radialGradient>
        <clipPath id={id("mouth")}>
          <path d={MOUTH_HAPPY} />
        </clipPath>
        <clipPath id={id("faceClip")}>
          <path d={OPENING} />
        </clipPath>
      </defs>

      {/* Lengan kanan karakter (sisi kiri layar), menjuntai di balik hijab */}
      <path d="M90 240C74 238 62 248 58 266L44 420H84C84 380 86 330 90 300Z" fill={url("tunic")} />
      {/* Lengan atas yang melambai (di balik hijab) */}
      <path
        d="M200 238C217 235 230 245 234 262L258 326C261 336 256 346 244 348H228C222 346 218 340 216 334L197 279Z"
        fill={url("sleeve")}
      />

      {/* Badan — gamis krem */}
      <path d={TUNIC} fill={url("tunic")} />
      <g stroke={P.cream.deep} strokeOpacity="0.35" strokeWidth="2.6" fill="none" strokeLinecap="round">
        <path d="M110 380C124 392 138 398 148 400" />
        <path d="M188 380C176 392 162 398 152 400" />
        <path d="M148 366V420" strokeOpacity="0.25" />
      </g>

      {/* Hijab */}
      <path d={HIJAB} fill={url("hijab")} />
      <path d={HIJAB} fill={url("hijabSide")} />
      <path d={HIJAB} fill={url("hijabHi")} />
      <ellipse cx="148" cy="206" rx="58" ry="20" fill={url("chinShadow")} />
      <g stroke={P.green.deep} strokeOpacity="0.2" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M112 262C100 280 86 296 72 306" />
        <path d="M196 238C204 262 214 284 228 300" />
        <path d="M156 262C160 290 158 318 150 344" strokeOpacity="0.14" />
      </g>
      {/* Lilitan pashmina */}
      <path d={WRAP} fill={P.green.deep} opacity="0.3" transform="translate(-2 7)" />
      <path d={WRAP} fill={url("wrap")} />
      <path
        d="M196 176C180 204 146 220 98 236C78 244 62 258 58 276"
        stroke="#ffffff"
        strokeOpacity="0.28"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M52 306C64 330 100 348 148 352C196 348 232 330 244 306"
        stroke="#ffffff"
        strokeOpacity="0.14"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M104 80C118 63 142 56 166 58C142 64 122 74 110 93Z" fill="#ffffff" opacity="0.24" />

      {/* Wajah (dipotong mengikuti bukaan hijab) */}
      <g clipPath={url("faceClip")}>
        <path d={FACE} fill={url("face")} />
        <path d={FACE} fill={url("faceShade")} />
        <path d={OPENING} fill="none" stroke={P.skin.deep} strokeOpacity="0.28" strokeWidth="16" />
        <ellipse cx="128" cy="100" rx="17" ry="7" fill="#ffffff" opacity="0.16" transform="rotate(-10 128 100)" />
        <ellipse cx="148" cy="183" rx="10" ry="4" fill="#ffffff" opacity="0.14" />
      </g>
      {/* Bingkai hijab di sekeliling wajah + ciput */}
      <path d={OPENING} fill="none" stroke={P.green.mid} strokeWidth="10" />
      <path
        d="M101 118C107 94 125 80 148 80C171 80 189 94 195 118"
        fill="none"
        stroke={P.green.deep}
        strokeOpacity="0.55"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M95 131C95 100 116 77 148 77C180 77 201 100 201 131"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.2"
        strokeWidth="2"
        transform="translate(0 -4.5)"
      />
      {/* Peniti mutiara */}
      <circle cx="199" cy="176" r="4.4" fill={url("pearl")} />
      <circle cx="197.7" cy="174.6" r="1.3" fill="#ffffff" />

      <ellipse className={styles.blush} cx="115" cy="157" rx="12" ry="7.5" fill={url("blush")} />
      <ellipse className={styles.blush} cx="181" cy="157" rx="12" ry="7.5" fill={url("blush")} />
      <path
        d="M143 153Q148 157.5 153 153"
        stroke={P.skin.deep}
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <ellipse cx="147.5" cy="146" rx="3.6" ry="2.7" fill="#ffffff" opacity="0.32" />

      {/* Lengan bawah & tangan yang melambai (di depan hijab) */}
      <g className={styles.wave} style={{ transformOrigin: "246px 340px" }}>
        <path d={FOREARM} fill={P.green.deep} opacity="0.22" transform="translate(-4 2)" />
        <path d={FOREARM} fill={url("forearm")} />
        <g className={styles.waveHand} style={{ transformOrigin: "258px 252px" }}>
          <g transform="translate(258 252) scale(0.92) translate(-258 -252)">
            <path d={HAND} fill={url("hand")} />
            <path d={HAND} fill="none" stroke={P.skin.deep} strokeOpacity="0.22" strokeWidth="1.2" />
            <g stroke={P.skin.shadow} strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.85">
              <path d="M266.5 195C266.5 201 266.2 207 265.6 213" />
              <path d="M259.5 191.5C259.4 198 259.2 205 258.7 212" />
              <path d="M252.5 192.5C252.4 199 252.2 205 251.7 212" />
            </g>
            <path
              d="M262 233C257 236 251 236 246 233"
              stroke={P.skin.shadow}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <ellipse cx="264" cy="206" rx="4" ry="7" fill="#ffffff" opacity="0.22" />
          </g>
        </g>
        <path d="M273 263C267 257 249 255 242 260L243 248C251 243 266 244 273 250Z" fill={P.cream.highlight} />
        <path
          d="M273 263C267 257 249 255 242 260"
          stroke={P.green.base}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Mata terbuka + bulu mata */}
      <g className={styles.expr} data-expr="neutral happy thinking confused apologetic">
        <g className={styles.look}>
          <g className={styles.eyeShift}>
            <g className={styles.blink}>
              <ellipse cx="127" cy="133" rx="6.9" ry="8.9" fill={url("eye")} />
              <ellipse cx="169" cy="133" rx="6.9" ry="8.9" fill={url("eye")} />
              <circle cx="129.7" cy="129.3" r="2.6" fill={P.eye.highlight} />
              <circle cx="171.7" cy="129.3" r="2.6" fill={P.eye.highlight} />
              <circle cx="124.7" cy="136.6" r="1.15" fill={P.eye.highlight} opacity="0.85" />
              <circle cx="166.7" cy="136.6" r="1.15" fill={P.eye.highlight} opacity="0.85" />
              <g stroke={P.eye.pupil} strokeWidth="2.4" strokeLinecap="round" fill="none">
                <path d="M118.6 128.2Q126.5 121.4 135.8 125.6" />
                <path d="M160.2 125.6Q169.5 121.4 177.4 128.2" />
                <path d="M119.4 128.6L115.6 126.4" />
                <path d="M176.6 128.6L180.4 126.4" />
              </g>
            </g>
          </g>
        </g>
      </g>
      <g
        className={styles.expr}
        data-expr="supportive"
        stroke={P.eye.pupil}
        strokeWidth="3.3"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M119.5 135Q127 126 134.5 135" />
        <path d="M161.5 135Q169 126 176.5 135" />
        <path d="M119.8 133.6L116.4 131.6" strokeWidth="2.2" />
        <path d="M176.2 133.6L179.6 131.6" strokeWidth="2.2" />
      </g>

      {/* Alis */}
      <g fill="none" stroke={P.hair.base} strokeWidth="3.6" strokeLinecap="round">
        <g className={styles.expr} data-expr="neutral happy supportive">
          <g className={styles.browLift}>
            <path d="M116 114Q126 107 137 111" />
            <path d="M159 111Q170 107 180 114" />
          </g>
        </g>
        <g className={styles.expr} data-expr="thinking">
          <path d="M116 113Q126 109 137 112" />
          <path d="M159 106Q170 99 181 106" />
        </g>
        <g className={styles.expr} data-expr="confused">
          <path d="M116 108Q125 102 137 108" />
          <path d="M159 115Q170 113 180 117" />
        </g>
        <g className={styles.expr} data-expr="apologetic">
          <path d="M116 116Q127 113 137 106" />
          <path d="M159 106Q169 113 180 116" />
        </g>
      </g>

      {/* Mulut */}
      <g fill="none" stroke={P.mouth.lipFemale} strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round">
        <path className={styles.expr} data-expr="neutral" d="M136 168Q148 176.5 160 168" />
        <path className={styles.expr} data-expr="supportive" d="M133 166Q148 180 163 166" />
        <path className={styles.expr} data-expr="thinking" d="M141 170.5Q148.5 172 156 168" />
        <path
          className={styles.expr}
          data-expr="confused"
          d="M135 170Q140 165.5 145 169Q150 172.5 155 168.5Q158.5 166 162 169"
        />
        <path className={styles.expr} data-expr="apologetic" d="M139 170Q148 174.5 157 170" />
      </g>
      <g className={styles.expr} data-expr="happy">
        <path d={MOUTH_HAPPY} fill={P.mouth.inside} />
        <g clipPath={url("mouth")}>
          <path d="M128 160H168V168.8Q148 173 128 168.8Z" fill={P.mouth.teeth} />
          <ellipse cx="148" cy="181.5" rx="9" ry="5.5" fill={P.mouth.tongue} />
        </g>
      </g>

      {/* Aksen ekspresi */}
      <g className={styles.expr} data-expr="thinking">
        <g className={styles.thought}>
          <circle cx="200" cy="74" r="4" />
          <circle cx="212" cy="58" r="6" />
          <circle cx="229" cy="40" r="8.5" />
        </g>
      </g>
      <g className={styles.expr} data-expr="confused">
        <text x="206" y="74" className={styles.question}>
          ?
        </text>
      </g>
      <g className={styles.expr} data-expr="apologetic">
        <path
          d="M196 86C192 94 189.5 98 189.5 101.5A6.5 6.5 0 0 0 202.5 101.5C202.5 98 200 94 196 86Z"
          fill={P.accent.sweat}
        />
        <ellipse cx="193.6" cy="100.5" rx="1.6" ry="2.6" fill="#ffffff" opacity="0.8" />
      </g>
      <g className={styles.expr} data-expr="supportive">
        <path
          className={styles.heart}
          d="M205 74C205 68 213 66 215 72C217 66 225 68 225 74C225 81 215 86 215 86C215 86 205 81 205 74Z"
          fill={P.accent.heart}
        />
      </g>
      <g className={styles.expr} data-expr="happy">
        <path
          className={styles.spark}
          d="M212 62L214.4 68.6L221 71L214.4 73.4L212 80L209.6 73.4L203 71L209.6 68.6Z"
          fill={P.accent.spark}
        />
      </g>
    </svg>
  );
}
