const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getDate()} ${MOIS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatYear(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).getFullYear().toString();
}

export function formatLifespan(
  birthDate: string | null,
  deathDate: string | null,
  isAlive: boolean
): string {
  const birth = formatYear(birthDate);
  const death = formatYear(deathDate);

  if (!birth) return "";
  if (isAlive) return `Né(e) en ${birth}`;
  if (death) return `${birth} – ${death}`;
  return `Né(e) en ${birth}`;
}
