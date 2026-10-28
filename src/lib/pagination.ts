export type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

export function getPaginationSearch<T extends object>(search: T, page: number) {
	return { ...search, page: page > 1 ? page : undefined };
}

export function getPaginationItems(
	currentPage: number,
	totalPages: number,
): PaginationItem[] {
	if (!Number.isFinite(totalPages) || totalPages < 1) return [];
	const total = Math.floor(totalPages);
	const current = Math.min(
		total,
		Math.max(1, Number.isFinite(currentPage) ? Math.floor(currentPage) : 1),
	);
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	if (current <= 4) return [1, 2, 3, 4, 5, "end-ellipsis", total];
	if (current >= total - 3)
		return [
			1,
			"start-ellipsis",
			total - 4,
			total - 3,
			total - 2,
			total - 1,
			total,
		];
	return [
		1,
		"start-ellipsis",
		current - 1,
		current,
		current + 1,
		"end-ellipsis",
		total,
	];
}
