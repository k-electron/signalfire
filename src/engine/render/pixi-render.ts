import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import type { DomainEvent } from "../../core/ports/domain-event";
import type { RenderOut } from "../../core/ports/render-out";
import { tokens } from "../../core/theme/tokens";

export const LANE_FINGERS = [
	{ name: "lPinky", color: tokens.finger.lPinky.int },
	{ name: "lRing", color: tokens.finger.lRing.int },
	{ name: "lMiddle", color: tokens.finger.lMiddle.int },
	{ name: "lIndex", color: tokens.finger.lIndex.int },
	{ name: "thumb", color: tokens.finger.thumb.int },
	{ name: "rIndex", color: tokens.finger.rIndex.int },
	{ name: "rMiddle", color: tokens.finger.rMiddle.int },
	{ name: "rRing", color: tokens.finger.rRing.int },
	{ name: "rPinky", color: tokens.finger.rPinky.int },
] as const;

export function laneForCharacter(char: number): number {
	switch (char) {
		case 102: // 'f'
		case 70: // 'F'
		case 114: // 'r'
		case 116: // 't'
		case 103: // 'g'
		case 118: // 'v'
		case 98: // 'b'
			return 3; // Left Index
		case 106: // 'j'
		case 74: // 'J'
		case 117: // 'u'
		case 121: // 'y'
		case 104: // 'h'
		case 109: // 'm'
		case 110: // 'n'
			return 5; // Right Index
		case 32: // ' ' (Space)
			return 4; // Thumb
		case 100: // 'd'
		case 101: // 'e'
		case 99: // 'c'
			return 2; // Left Middle
		case 107: // 'k'
		case 105: // 'i'
		case 44: // ','
			return 6; // Right Middle
		case 115: // 's'
		case 119: // 'w'
		case 120: // 'x'
			return 1; // Left Ring
		case 108: // 'l'
		case 111: // 'o'
		case 46: // '.'
			return 7; // Right Ring
		case 97: // 'a'
		case 113: // 'q'
		case 122: // 'z'
			return 0; // Left Pinky
		case 59: // ';'
		case 112: // 'p'
		case 47: // '/'
		case 39: // '\''
			return 8; // Right Pinky
		default:
			return 4; // fallback to thumb lane
	}
}

export type NoteDefinition = {
	readonly id: number;
	readonly character: number;
};

export type PixiRenderOptions = {
	readonly width?: number;
	readonly height?: number;
	readonly notes?: readonly NoteDefinition[];
};

type NoteView = {
	readonly container: Container;
	readonly background: Graphics;
	readonly text: Text;
	character: number;
	lane: number;
	active: boolean;
	error: boolean;
	visible: boolean;
};

export class PixiRenderAdapter implements RenderOut {
	private readonly width: number;
	private readonly height: number;
	private readonly noteDefs: readonly NoteDefinition[];
	private app: Application | null = null;
	private stage: Container | null = null;

	private notePool: NoteView[] = [];
	private activeNoteIndex = 0;
	private errorState = false;

	constructor(options: PixiRenderOptions = {}) {
		this.width = options.width ?? 900;
		this.height = options.height ?? 600;
		this.noteDefs = options.notes ?? [];
	}

	async init(container: HTMLElement): Promise<void> {
		const app = new Application();
		await app.init({
			width: this.width,
			height: this.height,
			backgroundColor: tokens.color.background.int,
			autoDensity: true,
			resolution:
				typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
			antialias: true,
			autoStart: false,
		});
		app.ticker.stop();

		this.app = app;
		this.stage = app.stage;
		container.appendChild(app.canvas);

		this.buildLanes();
		this.buildHitLine();
		this.buildNotePool();
	}

	private buildLanes(): void {
		if (this.stage === null) {
			return;
		}
		const g = new Graphics();
		const laneWidth = this.width / 9;

		for (let i = 0; i < 9; i++) {
			const x = i * laneWidth;
			const finger = LANE_FINGERS[i];
			const color = finger !== undefined ? finger.color : 0xffffff;

			// Lane background track with subtle finger tint
			g.rect(x, 0, laneWidth, this.height);
			g.fill({ color, alpha: 0.08 });

			// Lane divider line
			if (i > 0) {
				g.moveTo(x, 0);
				g.lineTo(x, this.height);
				g.stroke({ color: tokens.color.border.int, width: 1, alpha: 0.3 });
			}
		}

		this.stage.addChild(g);
	}

	private buildHitLine(): void {
		if (this.stage === null) {
			return;
		}
		const g = new Graphics();
		const hitY = this.getHitLineY();

		// Hit line spanning all nine lanes
		g.moveTo(0, hitY);
		g.lineTo(this.width, hitY);
		g.stroke({ color: tokens.color.primary.int, width: 2, alpha: 0.8 });

		this.stage.addChild(g);
	}

	private buildNotePool(): void {
		if (this.stage === null) {
			return;
		}

		const poolSize = Math.max(this.noteDefs.length, 4);
		const hitY = this.getHitLineY();
		const laneWidth = this.width / 9;

		const textStyle = new TextStyle({
			fontFamily: tokens.font.mono,
			fontSize: 32,
			fill: tokens.meaning.textActive.hex,
			align: "center",
		});

		for (let i = 0; i < poolSize; i++) {
			const container = new Container();
			const background = new Graphics();
			const text = new Text({ text: "", style: textStyle });
			text.anchor.set(0.5, 0.5);

			container.addChild(background);
			container.addChild(text);
			this.stage.addChild(container);

			const def = this.noteDefs[i];
			const character = def !== undefined ? def.character : 0;
			const lane = def !== undefined ? laneForCharacter(def.character) : 4;
			const label =
				character === 32 ? "␣" : String.fromCodePoint(character || 32);

			text.text = label;
			container.x = (lane + 0.5) * laneWidth;
			container.y = hitY;
			container.visible = def !== undefined;

			this.notePool.push({
				container,
				background,
				text,
				character,
				lane,
				active: i === 0,
				error: false,
				visible: def !== undefined,
			});
		}

		for (let i = 0; i < this.notePool.length; i++) {
			this.updateNoteView(i);
		}
	}

	private updateNoteView(index: number): void {
		const note = this.notePool[index];
		if (note === undefined) {
			return;
		}

		const isActive = index === this.activeNoteIndex;
		note.active = isActive;
		note.error = isActive && this.errorState;
		note.container.visible =
			index >= this.activeNoteIndex && note.character > 0;

		note.background.clear();
		const radius = 24;

		if (note.active) {
			if (note.error) {
				// Error tint
				note.background.circle(0, 0, radius);
				note.background.fill({
					color: tokens.color.destructive.int,
					alpha: 0.9,
				});
			} else {
				// Active note highlight
				note.background.circle(0, 0, radius + 4);
				note.background.fill({ color: tokens.color.primary.int, alpha: 0.3 });
				note.background.circle(0, 0, radius);
				note.background.fill({
					color: tokens.meaning.textActive.int,
					alpha: 0.9,
				});
			}
			note.text.style.fill = note.error
				? tokens.color.foreground.int
				: tokens.color.primaryForeground.int;
		} else {
			// Approaching/waiting unhit note
			note.background.circle(0, 0, radius);
			note.background.fill({ color: tokens.color.muted.int, alpha: 0.6 });
			note.text.style.fill = tokens.color.foreground.int;
		}
	}

	publish(events: readonly DomainEvent[]): void {
		for (const event of events) {
			if (event.type === "Hit") {
				const prevIndex = this.activeNoteIndex;
				this.errorState = false;
				this.activeNoteIndex += 1;
				this.updateNoteView(prevIndex);
				this.updateNoteView(this.activeNoteIndex);
			} else if (event.type === "Error") {
				this.errorState = true;
				this.updateNoteView(this.activeNoteIndex);
			} else if (event.type === "LevelEnded") {
				this.errorState = false;
			}
		}
	}

	renderFrame(_interpolation: number): void {
		// Zero allocation per-frame update loop.
		// Updates existing transform properties without creating objects.
		const count = this.notePool.length;
		for (let i = 0; i < count; i++) {
			const note = this.notePool[i];
			if (note === undefined || !note.visible) {
				continue;
			}
			// Subtle idle pulse on active note without allocating
			if (note.active) {
				note.container.alpha = 1.0;
			}
		}
	}

	getLanesCount(): number {
		return 9;
	}

	getLaneColor(index: number): number | undefined {
		return LANE_FINGERS[index]?.color;
	}

	getHitLineY(): number {
		return this.height * 0.8;
	}

	getActiveNoteLane(): number {
		const current = this.notePool[this.activeNoteIndex];
		return current !== undefined ? current.lane : -1;
	}

	getActiveNoteCharacter(): number {
		const current = this.notePool[this.activeNoteIndex];
		return current !== undefined ? current.character : 0;
	}

	isActiveNoteHighlighted(): boolean {
		const current = this.notePool[this.activeNoteIndex];
		return current?.active ?? false;
	}

	getActiveNoteErrorState(): boolean {
		return this.errorState;
	}

	getDisplayObjectCount(): number {
		if (this.stage === null) {
			return 0;
		}
		let count = 0;
		const countChildren = (container: Container) => {
			count += container.children.length;
			for (const child of container.children) {
				if (
					"children" in child &&
					Array.isArray((child as Container).children)
				) {
					countChildren(child as Container);
				}
			}
		};
		countChildren(this.stage);
		return count;
	}

	destroy(): void {
		if (this.app !== null) {
			this.app.ticker.stop();
			this.app.destroy(true, { children: true });
			this.app = null;
		}
		this.stage = null;
		this.notePool = [];
	}
}
