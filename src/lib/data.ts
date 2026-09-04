const img = (seed: string, w = 900, h = 1200) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export interface CatalogueObject {
  id: string;
  index: string;
  name: string;
  nature: string;
  price: string;
  img: string;
}

export const OBJECTS: CatalogueObject[] = [
  {
    id: "obj-001",
    index: "001",
    name: "Vessel in Raw Clay",
    nature: "Stoneware — fired at 1260°",
    price: "€240",
    img: img("objekt-vessel"),
  },
  {
    id: "obj-002",
    index: "002",
    name: "Meridian Floor Lamp",
    nature: "Patinated brass — hand spun",
    price: "€1,150",
    img: img("objekt-lamp"),
  },
  {
    id: "obj-003",
    index: "003",
    name: "Fold Chair No. 2",
    nature: "Steam-bent ash — natural oil",
    price: "€890",
    img: img("objekt-chair"),
  },
  {
    id: "obj-004",
    index: "004",
    name: "Slab Table, Low",
    nature: "Travertine — honed edge",
    price: "€2,400",
    img: img("objekt-table"),
  },
  {
    id: "obj-005",
    index: "005",
    name: "Wool Throw in Umber",
    nature: "Undyed highland wool",
    price: "€180",
    img: img("objekt-throw"),
  },
];

/** Dual-tone editorial fragment for the Anatomy orbital stage. */
export interface StudyPart {
  text: string;
  /** strong = charcoal focal words; mute = quiet connectors */
  tone: "strong" | "mute";
}

export interface StudyState {
  id: string;
  parts: StudyPart[];
}

export const STUDY = {
  object: OBJECTS[2],
  intro:
    "One object per issue is taken apart. Not physically — narratively. This issue: the Fold Chair No. 2.",
  /** Three scroll-pinned editorial states around one object. */
  states: [
    {
      id: "frame",
      parts: [
        { text: "The Fold Chair", tone: "strong" },
        { text: " is ash bent once — ", tone: "mute" },
        { text: "grain unbroken", tone: "strong" },
        { text: " from floor to backrest.", tone: "mute" },
      ],
    },
    {
      id: "joinery",
      parts: [
        { text: "Every joint", tone: "strong" },
        { text: " is a wedged tenon. ", tone: "mute" },
        { text: "No screws.", tone: "strong" },
        { text: " Built to be taken apart a century from now.", tone: "mute" },
      ],
    },
    {
      id: "finish",
      parts: [
        { text: "Linseed oil", tone: "strong" },
        { text: " darkens where hands rest. The chair ", tone: "mute" },
        { text: "keeps a diary", tone: "strong" },
        { text: " of its room.", tone: "mute" },
      ],
    },
  ] satisfies StudyState[],
};

export const LOOKBOOK = [
  {
    src: img("objekt-field-a", 1000, 1250),
    caption: "Fig. 01 — Morning light, north window",
    speed: 0.12,
  },
  {
    src: img("objekt-field-b", 900, 700),
    caption: "Fig. 02 — The lamp, unlit",
    speed: -0.08,
  },
  {
    src: img("objekt-field-c", 800, 1100),
    caption: "Fig. 03 — Travertine, honed",
    speed: 0.18,
  },
  {
    src: img("objekt-field-d", 1100, 800),
    caption: "Fig. 04 — Wool, undyed",
    speed: -0.14,
  },
];

/** Full-bleed sculptural environment for the hero only. */
export const HERO_ENVIRONMENT = "/hero/objekt-environment2.png";

/** Transparent-cutout foreground figures for the hero only. */
export const HERO_FIGURES = "/hero/objekt-figures.png";
