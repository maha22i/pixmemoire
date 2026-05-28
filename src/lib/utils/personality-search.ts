/**
 * Vérifie si une personnalité correspond à une recherche par nom
 * (full_name et display_name uniquement).
 */
export function matchesPersonalityNameSearch(
  fullName: string,
  displayName: string,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return (
    fullName.toLowerCase().includes(q) ||
    displayName.toLowerCase().includes(q)
  );
}
