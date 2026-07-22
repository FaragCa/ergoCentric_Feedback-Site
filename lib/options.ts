// Product-code component options, transcribed from the ErgoCentric code diagram.
// Each editable segment of  t-MBMESH-SG-TMBMSS-TALSC-TCL360  is one component.

export type Option = { code: string; label: string };
export type OptionGroup = { group: string; options: Option[] };
export type ComponentKey =
  | "series" | "color" | "model" | "mechanism" | "seat" | "airLumbar" | "arms";

// --- Mechanism -----------------------------------------------------------
export const MECHANISM: Option[] = [
  { code: "MT", label: "Multi Tilt" },
  { code: "SG", label: "Synchro Glide" },
  { code: "ST", label: "Synchro Tilt" },
  { code: "HD", label: "Heavy Duty" },
  { code: "KT", label: "Knee Tilt" },
  { code: "BR", label: "Boardroom" },
  { code: "CH", label: "Counter Height" },
  { code: "DT", label: "Dedicated Task" },
  { code: "350MT", label: "Plus Size Multi Tilt" },
  { code: "MTLITE", label: "Multi Tilt Lite" },
];

// --- Air Lumbar ----------------------------------------------------------
export const AIR_LUMBAR: Option[] = [
  { code: "TLS", label: "tCentric Lumbar support (12\"w x 6\"h) (Black)" },
  { code: "TLSAL", label: "tCentric Air Lumbar 1 (hand pump) (Black)" },
  { code: "TALSC", label: "tCentric Air Lumbar 2 (built in) (Black)" },
  { code: "TLSG", label: "tCentric Lumbar support (12\"w x 6\"h) (Grey)" },
  { code: "TLSALG", label: "tCentric Air Lumbar 1 (hand pump) (Grey)" },
  { code: "TALSCG", label: "tCentric Air Lumbar 2 (built in) (Grey)" },
  { code: "AL", label: "Air lumbar (Black)" },
  { code: "ALG", label: "Air lumbar (Grey)" },
  { code: "AT", label: "Air thoracic (Black)" },
  { code: "ATG", label: "Air thoracic (Grey)" },
  { code: "ATL", label: "Air thoracic and air lumbar" },
];

// --- Arms ----------------------------------------------------------------
export const ARMS: Option[] = [
  { code: "4ATAOT", label: "4\" Adjustable T-Arm" },
  { code: "3ATAOT", label: "3\" Adjustable T-Arm" },
  { code: "SWV", label: "4\" Adjustable Swivel Arm" },
  { code: "TCL", label: "tCentric Armrest Height & Lateral Adjustable" },
  { code: "TC360", label: "tCentric Armrest Height & Swivel Adjustable" },
  { code: "TCL360", label: "tCentric Armrest Height, Lateral & Swivel" },
];

// --- Seat size (grouped by seat family) ----------------------------------
export const SEAT_GROUPS: OptionGroup[] = [
  {
    group: "tCentric Hybrid Mesh Seat",
    options: [
      { code: "TMBMSS", label: "Small — 20\"w x 16½\"d" },
      { code: "TMBMS", label: "Large/Standard — 21\"w x 18½\"d" },
      { code: "TMBMXLS", label: "Extra Long — 21\"w x 19½\"d" },
    ],
  },
  {
    group: "Standard foam (tCentric / airCentric / geoCentric / ecoCentric / eCentric / myCentric / Saffron / ergoForce / Specialty)",
    options: [
      { code: "XSS", label: "Extra Small — 17½\"w x 15½\"d" },
      { code: "SS", label: "Small — 18½\"w x 17\"d" },
      { code: "LS", label: "Large/Standard — 20\"w x 19\"d" },
      { code: "PS", label: "Plus Size — 22\"w x 19\"d" },
      { code: "XLS", label: "Extra Long — 20\"w x 21\"d" },
      { code: "XPS", label: "Extra Deep — 22\"w x 21\"d" },
    ],
  },
  {
    group: "eCentric Executive / 24Centric",
    options: [
      { code: "24CS", label: "Small — 20\"w x 17\"d" },
      { code: "SSHD", label: "Small Heavy Duty — 24\"w x 19\"d" },
      { code: "24CSTD", label: "Large/Standard — 24\"w x 19\"d" },
      { code: "LSHD", label: "Large Heavy Duty — 24\"w x 21\"d" },
      { code: "24CPS", label: "Plus Size — 22\"w x 21\"d" },
      { code: "24CXW", label: "Extra Wide — 24\"w x 21\"d" },
    ],
  },
  {
    group: "e500",
    options: [
      { code: "E5LSHD", label: "Large/Standard — 22\"w x 21\"d" },
      { code: "E5XW", label: "Extra Wide — 26\"w x 21\"d" },
    ],
  },
];

export const SEAT_FLAT: Option[] = SEAT_GROUPS.flatMap((g) => g.options);

// --- Series names (reference only — no codes in the source diagram) -------
export const SERIES_NAMES: string[] = [
  "tCentric", "airCentric", "eCentric Executive", "myCentric", "Saffron",
  "geoCentric", "ecoCentric", "iCentric", "ergoForce", "24Centric", "e500",
  "Little Person Chair", "ergoCentric Specialty Seating", "ergoCentric Sit Stand",
  "3-in-1 Sit Stand", "Scooter Stool", "ergoCentric Cafe Stool", "Ergo F Series",
  "Ergo F ESD Series", "Ind F Series", "Ergo 2F Series", "Ergo 2F ESD Series",
  "Ind 2F Series",
];

// --- Human-readable component names + lookups ----------------------------
export const COMPONENT_LABELS: Record<ComponentKey, string> = {
  series: "Series",
  color: "Color",
  model: "Model",
  mechanism: "Mechanism",
  seat: "Seat size",
  airLumbar: "Air Lumbar",
  arms: "Arms",
};

// Which components are fixed dropdowns (have documented options) vs free text.
export const FREE_TEXT: ComponentKey[] = ["series", "color", "model"];

export type Selections = Record<ComponentKey, string>;

// Build the full product code from selections:  t-MBMESH-SG-TMBMSS-TALSC-TCL360
export function buildCode(s: Selections): string {
  return [
    s.series,
    `${s.color}${s.model}`,
    s.mechanism,
    s.seat,
    s.airLumbar,
    s.arms,
  ].join("-");
}

// Look up a friendly label for a code within a component (for change summaries).
export function labelFor(key: ComponentKey, code: string): string {
  const table: Record<ComponentKey, Option[]> = {
    series: [], color: [], model: [],
    mechanism: MECHANISM, seat: SEAT_FLAT, airLumbar: AIR_LUMBAR, arms: ARMS,
  };
  const hit = table[key].find((o) => o.code === code);
  return hit ? `${code} (${hit.label})` : code;
}
