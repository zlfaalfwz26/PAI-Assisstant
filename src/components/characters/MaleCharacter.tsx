import { P } from "./palette";
import styles from "./characters.module.css";

/**
 * Karakter laki-laki berkemeja hijau — ilustrasi SVG bergaya 3D lembut.
 * Placeholder resmi sampai gambar referensi tersedia (lihat
 * siteConfig.CHARACTERS). Bagian yang dianimasikan:
 *  - .wave / .waveHand : lambaian tangan (pivot siku & pergelangan)
 *  - .blink            : kedipan mata
 *  - [data-expr]       : lapisan ekspresi (happy, thinking, …)
 */

export const MALE_VIEWBOX = {
  half: "0 20 320 400",
  bust: "86 34 172 200",
} as const;

const FACE = "M172 64C208 64 230 90 230 126C230 158 212 188 172 196C132 188 114 158 114 126C114 90 136 64 172 64Z";
const HAIR =
  "M115 130C108 101 116 70 143 55C168 41 207 43 223 64C237 81 237 104 230 128C226 113 219 100 208 93C191 83 163 91 142 89C130 93 122 107 121 130Z";
const TORSO =
  "M150 211C124 219 96 224 84 242C74 258 70 300 68 420H276C274 300 270 258 260 242C248 224 220 219 194 211C184 222 160 222 150 211Z";
const HAND =
  "M27 253C21 239 20 214 23 200C26 187 51 185 54 198L56 222C60 215 67 211 71 215C75 220 71 231 63 239C59 244 56 249 54 255Z";
const MOUTH_HAPPY = "M155 163Q172 168 189 163Q187 187 172 187Q157 187 155 163Z";

export function MaleCharacter({ uid, crop = "half" }: { uid: string; crop?: keyof typeof MALE_VIEWBOX }) {
  const id = (name: string) => `${uid}-m-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg
      className={styles.svg}
      viewBox={MALE_VIEWBOX[crop]}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id("shirt")} x1="70" y1="215" x2="285" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.light} />
          <stop offset="0.5" stopColor={P.green.base} />
          <stop offset="1" stopColor={P.green.shadow} />
        </linearGradient>
        <radialGradient id={id("shirtHi")} cx="128" cy="252" r="128" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("shirtSide")} x1="180" y1="0" x2="276" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.deep} stopOpacity="0" />
          <stop offset="1" stopColor={P.green.deep} stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={id("sleeve")} x1="44" y1="236" x2="104" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.base} />
          <stop offset="1" stopColor={P.green.shadow} />
        </linearGradient>
        <linearGradient id={id("fringe")} x1="128" y1="56" x2="226" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6b4c3d" />
          <stop offset="0.5" stopColor={P.hair.base} />
          <stop offset="1" stopColor={P.hair.deep} />
        </linearGradient>
        <linearGradient id={id("forearm")} x1="24" y1="250" x2="74" y2="346" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.highlight} />
          <stop offset="0.45" stopColor={P.green.light} />
          <stop offset="1" stopColor={P.green.base} />
        </linearGradient>
        <linearGradient id={id("sleeveR")} x1="250" y1="236" x2="302" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.base} />
          <stop offset="1" stopColor={P.green.shadow} />
        </linearGradient>
        <linearGradient id={id("collar")} x1="128" y1="200" x2="214" y2="254" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.green.highlight} />
          <stop offset="1" stopColor={P.green.light} />
        </linearGradient>
        <radialGradient id={id("face")} cx="156" cy="108" r="104" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.skin.highlight} />
          <stop offset="0.48" stopColor={P.skin.light} />
          <stop offset="1" stopColor={P.skin.shadow} />
        </radialGradient>
        <linearGradient id={id("faceShade")} x1="114" y1="0" x2="231" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.skin.deep} stopOpacity="0.08" />
          <stop offset="0.55" stopColor={P.skin.deep} stopOpacity="0" />
          <stop offset="1" stopColor={P.skin.deep} stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={id("neck")} x1="0" y1="172" x2="0" y2="226" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.skin.deep} />
          <stop offset="0.5" stopColor={P.skin.shadow} />
          <stop offset="1" stopColor={P.skin.base} />
        </linearGradient>
        <radialGradient id={id("skin")} cx="0.38" cy="0.32" r="0.85">
          <stop offset="0" stopColor={P.skin.light} />
          <stop offset="0.6" stopColor={P.skin.base} />
          <stop offset="1" stopColor={P.skin.shadow} />
        </radialGradient>
        <radialGradient id={id("hand")} cx="0.36" cy="0.3" r="0.9">
          <stop offset="0" stopColor={P.skin.highlight} />
          <stop offset="0.55" stopColor={P.skin.light} />
          <stop offset="1" stopColor={P.skin.shadow} />
        </radialGradient>
        <linearGradient id={id("hair")} x1="118" y1="40" x2="232" y2="132" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.hair.light} />
          <stop offset="0.42" stopColor={P.hair.base} />
          <stop offset="1" stopColor={P.hair.deep} />
        </linearGradient>
        <radialGradient id={id("blush")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.blush} stopOpacity="0.6" />
          <stop offset="1" stopColor={P.blush} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("eye")} cx="0.42" cy="0.36" r="0.72">
          <stop offset="0" stopColor="#6a4430" />
          <stop offset="0.55" stopColor={P.eye.iris} />
          <stop offset="1" stopColor={P.eye.pupil} />
        </radialGradient>
        <clipPath id={id("mouth")}>
          <path d={MOUTH_HAPPY} />
        </clipPath>
      </defs>

      {/* Lengan kiri karakter (sisi kanan layar), menjuntai */}
      <path d="M250 238C268 236 281 247 286 265L302 420H260C261 378 259 326 254 290Z" fill={url("sleeveR")} />

      {/* Badan — kemeja hijau */}
      <path d={TORSO} fill={url("shirt")} />
      <path d={TORSO} fill={url("shirtSide")} />
      <path d={TORSO} fill={url("shirtHi")} />
      <path
        d="M256 262C263 300 268 360 269 420"
        stroke={P.green.deep}
        strokeOpacity="0.16"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke={P.green.deep} strokeOpacity="0.2" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M100 280C106 294 110 308 111 326" />
        <path d="M244 280C238 296 235 310 234 328" />
        <path d="M112 396C128 404 146 406 158 404" />
        <path d="M232 390C220 400 204 404 190 404" />
      </g>
      {/* Saku */}
      <path
        d="M198 264H228V291C228 297 224 300 218 300H208C202 300 198 297 198 291Z"
        fill={P.green.base}
        stroke={P.green.seam}
        strokeOpacity="0.38"
        strokeWidth="1.6"
      />
      <path d="M198 270.5H228" stroke={P.green.seam} strokeOpacity="0.38" strokeWidth="1.6" />
      {/* Plaket & kancing */}
      <path d="M165.5 234V420M178.5 234V420" stroke={P.green.seam} strokeOpacity="0.32" strokeWidth="1.6" />
      {[264, 300, 336, 372, 408].map((y) => (
        <g key={y}>
          <circle cx="172" cy={y + 1} r="3.6" fill={P.green.deep} opacity="0.25" />
          <circle cx="172" cy={y} r="3.4" fill="#f3fbf6" />
        </g>
      ))}

      {/* Kerah belakang, leher, kerah depan */}
      <path
        d="M148 214C150 200 159 194 172 194C185 194 194 200 196 214L198 223C187 214 157 214 146 223Z"
        fill={P.green.mid}
      />
      <path d="M154 170V216Q172 230 190 216V170Z" fill={url("neck")} />
      <path
        d="M131 256C146 251 160 244 172 236C184 244 198 251 213 256C198 256 184 251 172 243C160 251 146 256 131 256Z"
        fill={P.green.deep}
        fillOpacity="0.32"
      />
      <path
        d="M153 202C148 219 140 236 131 251C146 246 160 239 172 231C165 226 159 219 156 210Z"
        fill={url("collar")}
      />
      <path
        d="M191 202C196 219 204 236 213 251C198 246 184 239 172 231C179 226 185 219 188 210Z"
        fill={url("collar")}
      />
      <path
        d="M153 202C148 219 140 236 131 251M191 202C196 219 204 236 213 251"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Lengan kanan karakter (sisi kiri layar) — melambai */}
      <path
        d="M98 238C81 235 68 245 64 262L40 326C37 336 42 346 54 348H70C76 346 80 340 82 334L101 279Z"
        fill={url("sleeve")}
      />
      <path d="M100 279L82 334" stroke={P.green.deep} strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M41 333C47 343 60 346 71 339"
        stroke={P.green.deep}
        strokeOpacity="0.35"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <g className={styles.wave} style={{ transformOrigin: "52px 340px" }}>
        <path
          d="M33 337C25 312 23 284 27 257L53 253C55 281 62 307 72 335C66 349 41 351 33 337Z"
          fill={P.green.deep}
          opacity="0.28"
          transform="translate(4 2)"
        />
        <path
          d="M33 337C25 312 23 284 27 257L53 253C55 281 62 307 72 335C66 349 41 351 33 337Z"
          fill={url("forearm")}
        />
        <g className={styles.waveHand} style={{ transformOrigin: "40px 252px" }}>
          <path d={HAND} fill={url("hand")} />
          <path d={HAND} fill="none" stroke={P.skin.deep} strokeOpacity="0.22" strokeWidth="1.2" />
          <g stroke={P.skin.shadow} strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M31.5 195C31.5 201 31.8 207 32.4 213" />
            <path d="M38.5 191.5C38.6 198 38.8 205 39.3 212" />
            <path d="M45.5 192.5C45.6 199 45.8 205 46.3 212" />
          </g>
          <path
            d="M36 233C41 236 47 236 52 233"
            stroke={P.skin.shadow}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <ellipse cx="34" cy="206" rx="4" ry="7" fill="#ffffff" opacity="0.22" />
        </g>
        <path d="M25 263C31 257 49 255 56 260L55 248C47 243 32 244 25 250Z" fill={P.green.highlight} />
        <path
          d="M25 263C31 257 49 255 56 260"
          stroke={P.green.deep}
          strokeOpacity="0.3"
          strokeWidth="1.4"
          fill="none"
        />
      </g>

      {/* Telinga */}
      <ellipse cx="115" cy="137" rx="10.5" ry="15" fill={url("skin")} />
      <path
        d="M118.5 129C112.5 131 111.5 141 117.5 145"
        stroke={P.skin.deep}
        strokeOpacity="0.5"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="229" cy="137" rx="10.5" ry="15" fill={url("skin")} />
      <path
        d="M225.5 129C231.5 131 232.5 141 226.5 145"
        stroke={P.skin.deep}
        strokeOpacity="0.5"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Wajah */}
      <path d={FACE} fill={url("face")} />
      <path d={FACE} fill={url("faceShade")} />
      <path
        d="M121 113C128 99 141 93 156 93C176 93 197 89 211 101C200 97 182 101 164 102C146 103 131 105 121 113Z"
        fill={P.skin.deep}
        fillOpacity="0.2"
      />
      <ellipse className={styles.blush} cx="141" cy="156" rx="13.5" ry="8" fill={url("blush")} />
      <ellipse className={styles.blush} cx="203" cy="156" rx="13.5" ry="8" fill={url("blush")} />
      <path
        d="M166 151Q172 157.5 179 151"
        stroke={P.skin.deep}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <ellipse cx="171.5" cy="143.5" rx="4" ry="3" fill="#ffffff" opacity="0.32" />
      <ellipse cx="148" cy="96" rx="18" ry="6.5" fill="#ffffff" opacity="0.16" transform="rotate(-10 148 96)" />
      <ellipse cx="135" cy="146" rx="8" ry="4" fill="#ffffff" opacity="0.09" />
      <ellipse cx="172" cy="186" rx="11" ry="4" fill="#ffffff" opacity="0.07" />

      {/* Rambut */}
      <path d={HAIR} fill={url("hair")} />
      <path
        d="M127 86C138 63 174 51 205 62C220 68 228 82 228 102C216 88 196 81 174 83C157 84 140 88 127 86Z"
        fill={url("fringe")}
      />
      <path d="M139 63C156 52 188 51 205 63C186 59 162 61 146 72Z" fill={P.hair.light} opacity="0.6" />
      <g stroke={P.hair.light} strokeOpacity="0.45" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M149 67C162 72 180 74 200 74" />
        <path d="M134 80C150 72 172 68 196 70" />
        <path d="M206 68C214 74 220 84 222 94" />
      </g>

      {/* Mata terbuka */}
      <g className={styles.expr} data-expr="neutral happy thinking confused apologetic">
        <g className={styles.look}>
          <g className={styles.eyeShift}>
            <g className={styles.blink}>
              <ellipse cx="150" cy="128" rx="7.4" ry="9.6" fill={url("eye")} />
              <ellipse cx="194" cy="128" rx="7.4" ry="9.6" fill={url("eye")} />
              <circle cx="152.9" cy="124" r="2.8" fill={P.eye.highlight} />
              <circle cx="196.9" cy="124" r="2.8" fill={P.eye.highlight} />
              <circle cx="147.6" cy="131.8" r="1.25" fill={P.eye.highlight} opacity="0.85" />
              <circle cx="191.6" cy="131.8" r="1.25" fill={P.eye.highlight} opacity="0.85" />
            </g>
          </g>
        </g>
      </g>
      {/* Mata tersenyum (supportive) */}
      <g
        className={styles.expr}
        data-expr="supportive"
        stroke={P.eye.pupil}
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M142 131Q150 121.5 158 131" />
        <path d="M186 131Q194 121.5 202 131" />
      </g>

      {/* Alis */}
      <g fill="none" stroke={P.hair.base} strokeWidth="5" strokeLinecap="round">
        <g className={styles.expr} data-expr="neutral happy supportive">
          <g className={styles.browLift}>
            <path d="M139 109Q149 102 160 106" />
            <path d="M184 106Q195 102 205 109" />
          </g>
        </g>
        <g className={styles.expr} data-expr="thinking">
          <path d="M139 108Q149 104 160 107" />
          <path d="M184 101Q195 93 206 100" />
        </g>
        <g className={styles.expr} data-expr="confused">
          <path d="M139 103Q148 97 160 103" />
          <path d="M184 110Q195 108 205 113" />
        </g>
        <g className={styles.expr} data-expr="apologetic">
          <path d="M139 111Q150 108 160 101" />
          <path d="M184 101Q194 108 205 111" />
        </g>
      </g>

      {/* Mulut */}
      <g fill="none" stroke={P.mouth.line} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path className={styles.expr} data-expr="neutral" d="M158 167Q172 177.5 186 167" />
        <path className={styles.expr} data-expr="supportive" d="M155 165Q172 182 189 165" />
        <path className={styles.expr} data-expr="thinking" d="M164 170.5Q172 172 181 168" />
        <path
          className={styles.expr}
          data-expr="confused"
          d="M158 170Q163 165 168 169Q173 173 178 168.5Q182 165.5 186 169"
        />
        <path className={styles.expr} data-expr="apologetic" d="M162 170Q172 175 182 170" />
      </g>
      <g className={styles.expr} data-expr="happy">
        <path d={MOUTH_HAPPY} fill={P.mouth.inside} />
        <g clipPath={url("mouth")}>
          <path d="M150 160H194V169.5Q172 174 150 169.5Z" fill={P.mouth.teeth} />
          <ellipse cx="172" cy="184" rx="10" ry="6" fill={P.mouth.tongue} />
        </g>
      </g>

      {/* Aksen ekspresi */}
      <g className={styles.expr} data-expr="thinking">
        <g className={styles.thought}>
          <circle cx="104" cy="76" r="4" />
          <circle cx="91" cy="60" r="6" />
          <circle cx="74" cy="42" r="8.5" />
        </g>
      </g>
      <g className={styles.expr} data-expr="confused">
        <text x="78" y="80" className={styles.question}>
          ?
        </text>
      </g>
      <g className={styles.expr} data-expr="apologetic">
        <path
          d="M220 84C216 92 213.5 96 213.5 99.5A6.5 6.5 0 0 0 226.5 99.5C226.5 96 224 92 220 84Z"
          fill={P.accent.sweat}
        />
        <ellipse cx="217.6" cy="98.5" rx="1.6" ry="2.6" fill="#ffffff" opacity="0.8" />
      </g>
      <g className={styles.expr} data-expr="supportive">
        <path
          className={styles.heart}
          d="M80 78C80 72 88 70 90 76C92 70 100 72 100 78C100 85 90 90 90 90C90 90 80 85 80 78Z"
          fill={P.accent.heart}
        />
      </g>
      <g className={styles.expr} data-expr="happy">
        <path
          className={styles.spark}
          d="M94 66L96.4 72.6L103 75L96.4 77.4L94 84L91.6 77.4L85 75L91.6 72.6Z"
          fill={P.accent.spark}
        />
      </g>
    </svg>
  );
}
