import type { AppFlowEvent } from "../machines/app-flow";

type Item = {
	label: string;
	event: AppFlowEvent;
};

export function Results({
	items,
	selectedIndex,
	onOpen,
}: {
	items: readonly Item[];
	selectedIndex: number;
	onOpen: (event: AppFlowEvent) => void;
}) {
	return (
		<>
			<h1 className="text-display-lg">Results</h1>
			{items.map((item, index) => (
				<button
					key={item.label}
					type="button"
					tabIndex={-1}
					aria-current={index === selectedIndex ? "true" : undefined}
					className={index === selectedIndex ? "shadow-focus" : undefined}
					onClick={() => onOpen(item.event)}
				>
					{item.label}
				</button>
			))}
		</>
	);
}
