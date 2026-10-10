import { FaqSection } from "@/components/faq/faq-section";
import { m } from "@/paraglide/messages.js";

/** 首页负责选择问题，FAQ 展示组件保持与业务和语言无关。 */
export function HomeFaq() {
	return (
		<FaqSection
			eyebrow={m["home.faq.eyebrow"]()}
			title={m["home.faq.title"]()}
			items={[
				{
					id: "included",
					question: m["home.faq.included.question"](),
					answer: m["home.faq.included.answer"](),
				},
				{
					id: "pages",
					question: m["home.faq.pages.question"](),
					answer: m["home.faq.pages.answer"](),
				},
				{
					id: "languages",
					question: m["home.faq.languages.question"](),
					answer: m["home.faq.languages.answer"](),
				},
				{
					id: "styling",
					question: m["home.faq.styling.question"](),
					answer: m["home.faq.styling.answer"](),
				},
			]}
		/>
	);
}
