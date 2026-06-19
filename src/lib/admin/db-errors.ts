type DbErrorLike = {
  code?: string;
  message?: string;
};

export function getDbErrorMessage(
  error: DbErrorLike,
  fallback = "Erreur lors de la sauvegarde."
): string {
  if (error.code === "23505") {
    return "Ce slug existe déjà. Choisissez un autre nom ou modifiez le slug.";
  }
  if (error.code === "42501") {
    return "Permissions insuffisantes. Seuls les éditeurs et administrateurs peuvent effectuer cette action.";
  }
  if (error.message) {
    return error.message;
  }
  return fallback;
}
