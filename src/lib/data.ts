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

export interface Annotation {
  title: string;
  body: string;
  /** dot position over the study image, in percent */
  x: number;
  y: number;
}

export const STUDY = {
  object: OBJECTS[2],
  intro:
    "One object per issue is taken apart. Not physically — narratively. This issue: the Fold Chair No. 2.",
  annotations: [
    {
      title: "Steam-bent frame",
      body: "A single plank of ash is bent over fourteen hours of steam and clamp. No laminations, no shortcuts — the grain runs unbroken from floor to backrest.",
      x: 28,
      y: 22,
    },
    {
      title: "Joinery without screws",
      body: "Every connection is a wedged through-tenon. The chair can be disassembled with a mallet and reassembled by hand, a century from now.",
      x: 68,
      y: 38,
    },
    {
      title: "Finish that ages",
      body: "Raw linseed oil, burnished in three passes. It darkens where hands rest and pales where light falls — the chair keeps a diary of its room.",
      x: 40,
      y: 62,
    },
    {
      title: "Weight & balance",
      body: "4.1 kilograms. Light enough to lift with two fingers under the seat rail, planted enough that it never skates on a wooden floor.",
      x: 62,
      y: 84,
    },
  ] satisfies Annotation[],
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
export const HERO_ENVIRONMENT = "/hero/objekt-environment.png";

/** Transparent-cutout foreground figures for the hero only. */
export const HERO_FIGURES = "/hero/objekt-figures.png";
