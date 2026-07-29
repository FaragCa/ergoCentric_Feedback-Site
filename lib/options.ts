// Product-code component options, transcribed from the ErgoCentric code diagram.
// Real codes look like:  T-SG-LS-TALSC-TCL360-125MMLT-NC
//              or (mesh): T-MBMESH-SG-TMBMS-TALSC-TCL360-125MMLT-UC2
// Order: Series, [Model], Mechanism, Seat, Air Lumbar, Arms, Gas Lift, Caster/Glide.

export type Option = { code: string; label: string };
export type OptionGroup = { group: string; options: Option[] };
export type ComponentKey =
  | "series" | "model" | "mechanism" | "seat" | "lumbar" | "arms" | "lift" | "caster";

// --- Series (short codes seen in the data; editable) ----------------------
export const SERIES: Option[] = [
  { code: "T", label: "tCentric" },
  { code: "AIR2", label: "airCentric 2" },
  { code: "AIR", label: "airCentric" },
  { code: "E500", label: "e500" },
  { code: "24C", label: "24Centric" },
];

// --- Model / finish (optional segment; empty = foam & fabric) -------------
export const MODEL: Option[] = [
  { code: "", label: "Foam & fabric (no code)" },
  { code: "MBMESH", label: "Mesh — Midnight Black (MBMESH)" },
  { code: "MBUP", label: "Upholstered — Midnight Black (MBUP)" },
];

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
      { code: "TMBMLS", label: "Large — mesh" },
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

// --- Gas lift (commonly used pneumatic lifts, with seat-height range) ------
export const GAS_LIFT: Option[] = [
  { code: "70MMLT", label: "70 mmLT lift (12½\" – 15½\")" },
  { code: "70MM", label: "70 mm lift (13½\" – 16¼\")" },
  { code: "80MM", label: "80 mm lift (14¼\" – 17¼\")" },
  { code: "100MM", label: "100 mm lift (14¾\" – 18¾\")" },
  { code: "125MM", label: "125 mm lift (14\" – 18½\")" },
  { code: "125MMLT", label: "125 mmLT lift (14¾\" – 19\")" },
  { code: "140MM", label: "140 mm lift (16\" – 21¼\")" },
  { code: "157MM", label: "157 mm lift (18¼\" – 23¾\")" },
  { code: "200MM", label: "200 mm lift (23\" – 29½\")" },
  { code: "267MM", label: "267 mm lift (24¼\" – 34¼\")" },
];

// --- Caster / Glide (last segment) ---------------------------------------
export const CASTER_GROUPS: OptionGroup[] = [
  {
    group: "Casters",
    options: [
      { code: "E500CASTER", label: "e500 Caster" },
      { code: "CAC", label: "Silver Accent Caster" },
      { code: "NC", label: "Dual Wheel Nylon Caster" },
      { code: "UC", label: "Dual Wheel Urethane Caster" },
      { code: "FSW", label: "Heavy Duty Grey Single Wheel Caster" },
      { code: "LOF", label: "Lock-off Caster" },
      { code: "LON", label: "Lock-on Caster" },
      { code: "MAN", label: "Manual Lock Caster" },
      { code: "NC2", label: "Nylon Caster 2" },
      { code: "GNC2", label: "Nylon Caster 2 (glass)" },
      { code: "SW", label: "Single Wheel Nylon Caster" },
      { code: "SWU", label: "Single Wheel Urethane Caster" },
      { code: "UC2", label: "Urethane Caster 2" },
      { code: "GUC2", label: "Urethane Casters 2 (glass)" },
      { code: "ZC", label: "Zero Dual Wheel Urethane Casters" },
      { code: "OMC", label: "2\" Neoprene Caster" },
      { code: "OMU", label: "3\" Neoprene Caster" },
      { code: "NSC", label: "Nylon Stacker Caster" },
      { code: "USC", label: "Urethane Stacker Caster" },
    ],
  },
  {
    group: "Glides",
    options: [
      { code: "1G", label: "1¼\" Glide" },
      { code: "HG", label: "½\" (flat) Glide" },
      { code: "2G", label: "2¼\" Glide" },
      { code: "STACKGL", label: "Stacker Glide" },
    ],
  },
];
export const CASTER_FLAT: Option[] = CASTER_GROUPS.flatMap((g) => g.options);

// --- Human-readable component names + config -----------------------------
export const COMPONENT_LABELS: Record<ComponentKey, string> = {
  series: "Series",
  model: "Model / finish",
  mechanism: "Mechanism",
  seat: "Seat size",
  lumbar: "Air Lumbar",
  arms: "Arms",
  lift: "Gas lift",
  caster: "Caster / Glide",
};

// Series is a free-text (editable) field; everything else is a dropdown.
export const FREE_TEXT: ComponentKey[] = ["series"];

export type Selections = Record<ComponentKey, string>;
export const ORDER: ComponentKey[] =
  ["series", "model", "mechanism", "seat", "lumbar", "arms", "lift", "caster"];

// Build the full product code (the optional Model segment is dropped when empty).
export function buildCode(s: Selections): string {
  return ORDER
    .map((k) => s[k])
    .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
    .join("-");
}

// Friendly label for a code within a component (for change summaries).
export function labelFor(key: ComponentKey, code: string): string {
  if (key === "model" && (!code || code === "")) return "(foam & fabric)";
  const table: Record<ComponentKey, Option[]> = {
    series: SERIES, model: MODEL, mechanism: MECHANISM, seat: SEAT_FLAT,
    lumbar: AIR_LUMBAR, arms: ARMS, lift: GAS_LIFT, caster: CASTER_FLAT,
  };
  const hit = table[key].find((o) => o.code === code);
  return hit && hit.code ? `${code} (${hit.label})` : (code || "(none)");
}
