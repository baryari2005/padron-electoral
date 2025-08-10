export function formatDate(date?: Date | string | null): string {
    const months = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
    ];

    if (!date) return "Fecha inválida";

    const d = typeof date === "string" ? new Date(date) : date;

    if (isNaN(d.getTime())) return "Fecha inválida";

    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();

    return `${day} ${months[month]}, ${year}`;
}
