/** Flags wording that breaks the medical-wording rules (no "best", guarantees, prices...). */
const PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bbest\b/i, label: '"best"' },
  { re: /\bno\.?\s*1\b|\bnumber\s*one\b/i, label: '"No. 1"' },
  { re: /\bguarantee(d|s)?\b/i, label: '"guarantee"' },
  { re: /\b100\s*%/i, label: '"100%"' },
  { re: /\bpermanent(ly)?\s+cure(d|s)?\b/i, label: '"permanent cure"' },
  { re: /\bno\s+side[\s-]effects?\b/i, label: '"no side effects"' },
  { re: /(₹|\brs\.?\s*\d|\binr\s*\d|\brupees?\b)/i, label: "a price" },
];

export function checkWording(text: string): string[] {
  const hits = new Set<string>();
  for (const p of PATTERNS) if (p.re.test(text)) hits.add(p.label);
  return [...hits];
}

/** Collect all strings in a value (deep) and check them. */
export function checkWordingDeep(value: unknown): string[] {
  const hits = new Set<string>();
  const walk = (v: unknown) => {
    if (typeof v === "string") checkWording(v).forEach((h) => hits.add(h));
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(value);
  return [...hits];
}
