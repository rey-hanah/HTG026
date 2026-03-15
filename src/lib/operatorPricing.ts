/**
 * Operator-based parking rate lookup for Vancouver.
 *
 * These are approximate/representative rates based on publicly posted signage
 * and operator websites as of 2025. Actual rates vary by specific lot/location.
 */

export interface OperatorRates {
  operator: string;
  hourly?: string;
  daily?: string;
  evening?: string;
  summary: string; // one-line displayed on card
}

const OPERATOR_RATES: Record<string, OperatorRates> = {
  // ── Municipal / Free ─────────────────────────────────────────────────────
  "city of vancouver": {
    operator: "City of Vancouver",
    summary: "Free (City-operated)",
  },
  "park board": {
    operator: "Park Board",
    summary: "Free (Park Board)",
  },
  "easy park / park board": {
    operator: "Easy Park / Park Board",
    hourly: "$2.00–$3.00/hr",
    daily: "$10–$15/day",
    summary: "$2–$3/hr · $10–$15/day",
  },

  // ── EasyPark ─────────────────────────────────────────────────────────────
  easypark: {
    operator: "EasyPark",
    hourly: "$3.00–$6.00/hr",
    daily: "$12–$24/day",
    evening: "$6.00 flat (6 PM–6 AM)",
    summary: "$3–$6/hr · $12–$24/day",
  },
  "easy park": {
    operator: "EasyPark",
    hourly: "$3.00–$6.00/hr",
    daily: "$12–$24/day",
    evening: "$6.00 flat (6 PM–6 AM)",
    summary: "$3–$6/hr · $12–$24/day",
  },

  // ── Impark ───────────────────────────────────────────────────────────────
  impark: {
    operator: "Impark",
    hourly: "$3.00–$7.00/hr",
    daily: "$15–$25/day",
    evening: "$7.00 flat (6 PM–6 AM)",
    summary: "$3–$7/hr · $15–$25/day",
  },

  // ── Indigo ───────────────────────────────────────────────────────────────
  indigo: {
    operator: "Indigo",
    hourly: "$4.00–$8.00/hr",
    daily: "$18–$30/day",
    evening: "$8.00 flat (6 PM–6 AM)",
    summary: "$4–$8/hr · $18–$30/day",
  },
  "indigo park": {
    operator: "Indigo",
    hourly: "$4.00–$8.00/hr",
    daily: "$18–$30/day",
    evening: "$8.00 flat (6 PM–6 AM)",
    summary: "$4–$8/hr · $18–$30/day",
  },

  // ── Diamond Parking ──────────────────────────────────────────────────────
  "diamond parking": {
    operator: "Diamond Parking",
    hourly: "$3.00–$5.00/hr",
    daily: "$12–$20/day",
    summary: "$3–$5/hr · $12–$20/day",
  },

  // ── ParkN Fly / other airport-area ───────────────────────────────────────
  "park'n fly": {
    operator: "Park'N Fly",
    hourly: "$5.00/hr",
    daily: "$20–$35/day",
    summary: "$5/hr · $20–$35/day",
  },

  // ── BC Hydro (EV) ───────────────────────────────────────────────────────
  "bc hydro": {
    operator: "BC Hydro",
    hourly: "Free (Level 2)",
    summary: "Free Level 2 charging",
  },

  // ── FLO (EV network) ────────────────────────────────────────────────────
  flo: {
    operator: "FLO",
    hourly: "$1.00/hr (Level 2) · $0.30/min (DC fast)",
    summary: "$1/hr L2 · $0.30/min DCFC",
  },

  // ── ChargePoint (EV network) ─────────────────────────────────────────────
  chargepoint: {
    operator: "ChargePoint",
    hourly: "Varies by host · typically $1–$2/hr",
    summary: "~$1–$2/hr (varies by host)",
  },

  // ── Electrify Canada ────────────────────────────────────────────────────
  "electrify canada": {
    operator: "Electrify Canada",
    hourly: "$0.27–$0.40/min (DC fast)",
    summary: "$0.27–$0.40/min DCFC",
  },
};

/**
 * Look up pricing for an operator name. Case-insensitive, partial-match.
 * Returns undefined if no match found.
 */
export function getOperatorRates(operatorName: string): OperatorRates | undefined {
  if (!operatorName) return undefined;

  const key = operatorName.toLowerCase().trim();

  // Exact match first
  if (OPERATOR_RATES[key]) return OPERATOR_RATES[key];

  // Partial match: check if any known key is contained in the input
  for (const [known, rates] of Object.entries(OPERATOR_RATES)) {
    if (key.includes(known) || known.includes(key)) {
      return rates;
    }
  }

  return undefined;
}

/**
 * Returns a rate summary string for a given operator, or a fallback.
 */
export function getOperatorRateSummary(operatorName: string, fallback = "Paid (see sign)"): string {
  const rates = getOperatorRates(operatorName);
  return rates?.summary ?? fallback;
}
