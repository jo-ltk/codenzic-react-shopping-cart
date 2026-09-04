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
    name: "Leone Urn",
    nature: "Verde marble — bronze lion handles",
    price: "€1,280",
    img: "/products/vessel.jpg",
  },
  {
    id: "obj-002",
    index: "002",
    name: "Meridian Floor Lamp",
    nature: "Malachite shade — fluted bronze stem",
    price: "€2,450",
    img: "/products/lamp.jpg",
  },
  {
    id: "obj-003",
    index: "003",
    name: "Empire Wing Chair",
    nature: "Forest velvet — bronze lion arms",
    price: "€3,200",
    img: "/products/chair.jpg",
  },
  {
    id: "obj-004",
    index: "004",
    name: "Verde Sphere Table",
    nature: "Veined marble — gilt pedestal",
    price: "€4,100",
    img: "/products/table.jpg",
  },
  {
    id: "obj-005",
    index: "005",
    name: "Acanthus Throw",
    nature: "Woven green & gold — fringed edge",
    price: "€420",
    img: "/products/throw.jpg",
  },
  {
    id: "obj-006",
    index: "006",
    name: "Archival Floor Mirror",
    nature: "Emerald marble — gilt crest",
    price: "€5,800",
    img: "/products/mirror.jpg",
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
    "One object per issue is taken apart. Not physically — narratively. This issue: the Empire Wing Chair.",
  /** Three scroll-pinned editorial states around one object. */
  states: [
    {
      id: "frame",
      parts: [
        { text: "The Empire Wing Chair", tone: "strong" },
        { text: " holds court in forest velvet — ", tone: "mute" },
        { text: "lion arms", tone: "strong" },
        { text: " cast in burnished bronze.", tone: "mute" },
      ],
    },
    {
      id: "joinery",
      parts: [
        { text: "Every claw foot", tone: "strong" },
        { text: " carries weight like a sentinel. ", tone: "mute" },
        { text: "No soft edges.", tone: "strong" },
        { text: " Built for rooms that outlast seasons.", tone: "mute" },
      ],
    },
    {
      id: "finish",
      parts: [
        { text: "Velvet deepens", tone: "strong" },
        { text: " where light rests. The chair ", tone: "mute" },
        { text: "keeps a diary", tone: "strong" },
        { text: " of its room.", tone: "mute" },
      ],
    },
  ] satisfies StudyState[],
};

export const LOOKBOOK = [
  {
    src: "/products/mirror.jpg",
    caption: "Fig. 01 — Archival mirror, morning light",
    speed: 0.12,
  },
  {
    src: "/products/lamp.jpg",
    caption: "Fig. 02 — Meridian lamp, lit",
    speed: -0.08,
  },
  {
    src: "/products/table.jpg",
    caption: "Fig. 03 — Verde marble, gilt edge",
    speed: 0.18,
  },
  {
    src: "/products/throw.jpg",
    caption: "Fig. 04 — Acanthus weave, fringed",
    speed: -0.14,
  },
];

/** Full-bleed sculptural environment for the hero only. */
export const HERO_ENVIRONMENT = "/hero/objekt-environment2.png";

/** Transparent-cutout foreground figures for the hero only. */
export const HERO_FIGURES = "/hero/objekt-figures.png";
