import { PostList } from "@/components/blog/post-list";
import type { PostListData } from "@/modules/post/types";
import { HomeHero } from "./home-hero";

/** Compose home sections; the layout owns the main landmark and content anchor. */
export function HomePage({ data }: { data: PostListData }) {
	return (
		<>
			<HomeHero />
			<PostList data={data} />
		</>
	);
}
