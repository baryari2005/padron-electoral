export function getAvatarUrl(nombre: string, originalUrl?: string | null): string {
  if (originalUrl && originalUrl.trim() !== "") return originalUrl;

  const nameParam = nombre.trim().replace(/ /g, "+"); // ✅ usamos "+" directamente

  // 🔒 No usar URLSearchParams ni encodeURIComponent
  return `https://ui-avatars.com/api/?name=${nameParam}&background=adf5d7&color=000&size=128&rounded=true&bold=true&format=png`;
}
