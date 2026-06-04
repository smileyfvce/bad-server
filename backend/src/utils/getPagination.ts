export default function getPagination(pageRaw: unknown, limitRaw: unknown, defaultLimit = 10) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const limit = Math.min(defaultLimit, Math.max(1, Number(limitRaw) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
}