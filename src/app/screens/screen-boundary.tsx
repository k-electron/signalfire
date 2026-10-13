import { Component, type ReactNode } from "react";

type Props = {
	onBack: () => void;
	children: ReactNode;
};

type State = {
	failed: boolean;
};

export class ScreenBoundary extends Component<Props, State> {
	override state: State = { failed: false };

	static getDerivedStateFromError(): State {
		return { failed: true };
	}

	override componentDidCatch(error: unknown) {
		console.error(error);
	}

	override render() {
		if (this.state.failed) {
			return (
				<>
					<p>Something went wrong.</p>
					<button type="button" onClick={this.props.onBack}>
						Back
					</button>
				</>
			);
		}
		return this.props.children;
	}
}
