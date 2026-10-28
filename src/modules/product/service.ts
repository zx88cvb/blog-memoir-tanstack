import type { SiteEntry } from "@/types/site-entry";
import data from "../../../content/data/product.json";

function entries(data: SiteEntry[]) {
	return data
		.filter((entry) => entry.status === "active")
		.sort((a, b) => {
			const order =
				(a.order ?? Number.POSITIVE_INFINITY) -
				(b.order ?? Number.POSITIVE_INFINITY);
			if (!Number.isNaN(order) && order !== 0) return order;
			const date = (a.addedDate ?? "").localeCompare(b.addedDate ?? "");
			return -date;
		});
}

export const activeProducts = entries(data.friends);
