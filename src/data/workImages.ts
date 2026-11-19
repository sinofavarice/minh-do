export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  position?: string;
};

export type Project = {
  title: string;
  year: string;
  /** Short label under a landing-strip numeral (optional) */
  label?: string;
  /** Small mark above the project graphic on the plate */
  mark?: string;
  /** Monogram / logo letters drawn on the plate (placeholder graphic) */
  logo?: string;
  code?: string;
  location?: string;
  client?: string;
  category?: string;
  /** All-caps description lines overlaid at the bottom of the hero plate */
  copy: string[];
  /** Role labels on editorial spreads (after the first image) */
  credits?: string[];
  /** Short blurb on the work scroller (under active title) */
  blurb?: string;
  /** Body copy under credits on editorial spreads */
  body?: string;
  images: ProjectImage[];
};

export type ProjectSpread =
  | {
      kind: "hero";
      images: ProjectImage[];
      total: number;
    }
  | {
      kind: "pair";
      images: ProjectImage[];
      total: number;
      /** e.g. 02 + 03 / 07 */
      counter: string;
      layout: "stack" | "row";
    };

function padFrame(n: number) {
  return String(n).padStart(2, "0");
}

/** Hero + paired editorial spreads after image 01 */
export function projectSpreadCount(project: Project): number {
  if (project.images.length <= 1) return 1;
  return 1 + Math.ceil((project.images.length - 1) / 2);
}

export function projectSpread(
  project: Project,
  spreadIndex: number,
): ProjectSpread {
  const total = project.images.length;
  const max = projectSpreadCount(project) - 1;
  const index = Math.max(0, Math.min(max, spreadIndex));

  if (index === 0) {
    return { kind: "hero", images: [project.images[0]], total };
  }

  const start = 1 + (index - 1) * 2;
  const images = project.images.slice(start, start + 2);
  const a = start + 1;
  const b = start + images.length;
  const counter =
    images.length === 2
      ? `${padFrame(a)} + ${padFrame(b)} / ${padFrame(total)}`
      : `${padFrame(a)} / ${padFrame(total)}`;

  return {
    kind: "pair",
    images,
    total,
    counter,
    layout: index % 2 === 1 ? "stack" : "row",
  };
}

export const ROMAN = [
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
] as const;

/**
 * Real projects from assets/Port Projects. Titles follow the folder
 * names. The Retrofitted folder’s cover is a poster lettered RF, so
 * that title is RF. Covers are the first file in each folder: R1 frame
 * order, then other numbered files, then filenames that include a date.
 * Years are the capture dates stored on the files. Plate copy is
 * placeholder until the real lines are written.
 */
const plate = {
  mark: "LOREM",
  client: "Ipsum",
  location: "Lorem",
  category: "Editorial",
  copy: ["LOREM IPSUM DOLOR SIT AMET", "CONSECTETUR ADIPISCING ELIT"],
  credits: ["styling", "art direction", "production"],
  body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
};

export const galleryImages: Project[] = [
  {
    title: "BEKON",
    year: "2025",
    ...plate,
    images: [
      {
        src: "/work/bekon/97560016.png",
        width: 3088,
        height: 2048,
      },
      {
        src: "/work/bekon/97560021.png",
        width: 2463,
        height: 1633,
      },
      {
        src: "/work/bekon/97570005.png",
        width: 3088,
        height: 2048,
      },
      {
        src: "/work/bekon/97570011.png",
        width: 2047,
        height: 2612,
      },
      {
        src: "/work/bekon/97570029.png",
        width: 3088,
        height: 2048,
      },
      {
        src: "/work/bekon/975700f25.png",
        width: 2048,
        height: 3088,
      },
      {
        src: "/work/bekon/97590019.png",
        width: 3088,
        height: 2048,
      },
      {
        src: "/work/bekon/97590021.png",
        width: 3078,
        height: 2041,
      },
      {
        src: "/work/bekon/97590034-2.png",
        width: 3088,
        height: 2048,
      },
    ],
  },
  {
    title: "Care402",
    year: "2026",
    ...plate,
    images: [
      {
        src: "/work/care402/r1-04577d-034a.png",
        width: 3637,
        height: 2433,
      },
      {
        src: "/work/care402/r1-04578-020a-2.png",
        width: 2433,
        height: 3569,
      },
      {
        src: "/work/care402/r1-04578-028a.png",
        width: 3637,
        height: 2433,
      },
      {
        src: "/work/care402/r1-04755-011a.png",
        width: 2415,
        height: 3592,
      },
      {
        src: "/work/care402/r1-04755-032a.png",
        width: 2425,
        height: 3574,
      },
      {
        src: "/work/care402/r1-04755-035a.png",
        width: 3637,
        height: 2425,
      },
      {
        src: "/work/care402/r1-04757-002a-2.png",
        width: 2425,
        height: 3452,
      },
      {
        src: "/work/care402/r1-04757-028a.png",
        width: 2425,
        height: 3637,
      },
    ],
  },
  {
    title: "Coach x Meron",
    year: "2026",
    ...plate,
    images: [
      {
        src: "/work/coach-x-meron/r1-04260-015a.jpg",
        width: 3637,
        height: 2425,
      },
      {
        src: "/work/coach-x-meron/r1-04260-023a.jpg",
        width: 3637,
        height: 2425,
      },
      {
        src: "/work/coach-x-meron/r1-04260-027a.jpg",
        width: 3637,
        height: 2425,
      },
      {
        src: "/work/coach-x-meron/r1-04260-028a.jpg",
        width: 2425,
        height: 3637,
      },
      {
        src: "/work/coach-x-meron/r1-04260-035a.jpg",
        width: 3637,
        height: 2425,
      },
    ],
  },
  {
    title: "Elleanna",
    year: "2026",
    ...plate,
    images: [
      {
        src: "/work/elleanna/32020029.jpeg",
        width: 2048,
        height: 3088,
      },
      {
        src: "/work/elleanna/654367631-17987311631950645-1352021572776627370-n.jpeg",
        width: 1440,
        height: 1006,
      },
      {
        src: "/work/elleanna/655300783-17987311610950645-2839347636761907284-n.jpeg",
        width: 1440,
        height: 1006,
      },
      {
        src: "/work/elleanna/656267122-17987311640950645-9093721704616564058-n.jpeg",
        width: 1440,
        height: 1006,
      },
      {
        src: "/work/elleanna/656270595-17987311577950645-6812184010773773802-n-1.jpeg",
        width: 1440,
        height: 1006,
      },
      {
        src: "/work/elleanna/656278684-17987311586950645-1204333344777944199-n.jpeg",
        width: 1440,
        height: 1006,
      },
    ],
  },
  {
    title: "meu wahid",
    year: "2025",
    ...plate,
    images: [
      {
        src: "/work/meu-wahid/529437031-18064504919240027-7266861976165811387-n-1.jpeg",
        width: 1440,
        height: 962,
      },
      {
        src: "/work/meu-wahid/707774984-17996402597950645-7460970038620407573-n-2.jpeg",
        width: 2411,
        height: 1612,
      },
      {
        src: "/work/meu-wahid/photo-by-ug-on-august-16-2025-1.jpeg",
        width: 1440,
        height: 1920,
      },
      {
        src: "/work/meu-wahid/photo-by-ug-on-august-16-2025-2.jpeg",
        width: 1440,
        height: 1920,
      },
      {
        src: "/work/meu-wahid/untitled-november-12-2026-at-24-44-55.png",
        width: 1440,
        height: 962,
      },
    ],
  },
  {
    title: "Relocation",
    year: "2025",
    ...plate,
    images: [
      {
        src: "/work/relocation/r1-08040-0010.jpeg",
        width: 2433,
        height: 3637,
      },
      {
        src: "/work/relocation/r1-08040-0013.jpeg",
        width: 2433,
        height: 3637,
      },
      {
        src: "/work/relocation/r1-08040-0026-1.jpeg",
        width: 2433,
        height: 3637,
      },
      {
        src: "/work/relocation/r1-08040-0033.jpeg",
        width: 2433,
        height: 3637,
      },
    ],
  },
  {
    title: "RF",
    year: "2025",
    ...plate,
    images: [
      {
        src: "/work/retrofitted/582349742-17874800559442612-1406912599069928188-n-1.jpeg",
        width: 1350,
        height: 1687,
      },
      {
        src: "/work/retrofitted/583026521-17875413501442612-3428259887396158458-n-1.jpeg",
        width: 1440,
        height: 960,
      },
      {
        src: "/work/retrofitted/588430376-17877320235442612-4265200805258435698-n-1.jpeg",
        width: 1440,
        height: 960,
      },
      {
        src: "/work/retrofitted/589200994-17876224449442612-6837927409257602471-n.jpeg",
        width: 1440,
        height: 1920,
      },
      {
        src: "/work/retrofitted/photo-by-retrofitted-on-november-27-2025.jpeg",
        width: 1440,
        height: 1920,
      },
      {
        src: "/work/retrofitted/photo-by-retrofitted-on-december-15-2025-2.jpeg",
        width: 1440,
        height: 1920,
      },
      {
        src: "/work/retrofitted/photo-by-retrofitted-on-december-15-2025-3.jpeg",
        width: 1440,
        height: 1920,
      },
    ],
  },
  {
    title: "UGG Meron Jalen",
    year: "2026",
    ...plate,
    images: [
      {
        src: "/work/ugg-meron-jalen/r1-04883-002a.png",
        width: 3637,
        height: 2425,
      },
      {
        src: "/work/ugg-meron-jalen/639576775-17983979471950645-2829091162407884273-n.jpeg",
        width: 1170,
        height: 1552,
      },
      {
        src: "/work/ugg-meron-jalen/639731381-17983979420950645-8040742510622046018-n.jpeg",
        width: 1170,
        height: 1552,
      },
      {
        src: "/work/ugg-meron-jalen/photo-by-nasdirect-on-february-20-2026-1.jpeg",
        width: 1440,
        height: 1910,
      },
      {
        src: "/work/ugg-meron-jalen/photo-shared-by-nasdirect-on-february-20-2026-tagging-mementofilmlab.jpeg",
        width: 1170,
        height: 691,
      },
    ],
  },
  {
    title: "ZAY x ADIDAS x CLOT",
    year: "2026",
    ...plate,
    images: [
      {
        src: "/work/zay-x-adidas-x-clot/r1-07170-0023.png",
        width: 2422,
        height: 3633,
      },
      {
        src: "/work/zay-x-adidas-x-clot/r1-07170-0027.png",
        width: 2425,
        height: 3637,
      },
      {
        src: "/work/zay-x-adidas-x-clot/r1-07170-0028.png",
        width: 2410,
        height: 3614,
      },
      {
        src: "/work/zay-x-adidas-x-clot/690008389-17994021953950645-1012981290546852241-n.jpeg",
        width: 2425,
        height: 3031,
      },
      {
        src: "/work/zay-x-adidas-x-clot/691909720-17994021941950645-8211588407153195104-n.jpeg",
        width: 1080,
        height: 1350,
      },
      {
        src: "/work/zay-x-adidas-x-clot/696150810-17994021971950645-1031322319709029609-n.jpeg",
        width: 2319,
        height: 2898,
      },
    ],
  },
];

/** Default focus when opening /work (iv. photographs) */
export const GALLERY_FOCUS_INDEX = 3;

/** Cover image for fan / strip thumbs */
export function projectCover(project: Project): ProjectImage {
  return project.images[0];
}
