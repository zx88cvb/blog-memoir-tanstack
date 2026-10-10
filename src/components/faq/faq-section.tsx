import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

/** id 必须在列表内唯一，用于折叠状态和 React key。 */
export interface FaqItem {
	id: string;
	question: string;
	answer: string;
}
/** 纯展示组件：文字通过 props 传入，不读取语言或绑定特定页面。 */
export function FaqSection({
	title,
	eyebrow,
	items,
}: {
	title: string;
	eyebrow: string;
	items: readonly FaqItem[];
}) {
	return (
		<section
			id="faq"
			className="mx-auto w-[calc(100%-2rem)] max-w-3xl sm:w-[calc(100%-3rem)] pt-4 pb-12 sm:pt-6 sm:pb-16"
			aria-labelledby="faq-title"
		>
			<div className="mb-5 text-center">
				<span className="text-[.6875rem] font-semibold tracking-widest text-muted-foreground">
					{eyebrow}
				</span>
				<h2
					id="faq-title"
					className="mt-2 text-2xl leading-tight font-[650] tracking-tight sm:text-[1.75rem]"
				>
					{title}
				</h2>
			</div>
			<Accordion>
				{items.map((item) => (
					<AccordionItem
						key={item.id}
						value={item.id}
						className="border-border"
					>
						<AccordionTrigger className="gap-6 py-5 text-sm font-medium hover:no-underline">
							{item.question}
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground pb-6 text-sm leading-7">
							{item.answer}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</section>
	);
}
