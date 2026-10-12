export type DomainEvent =
	| { readonly type: "Hit"; readonly step: number }
	| { readonly type: "Error"; readonly step: number }
	| { readonly type: "WordComplete"; readonly step: number }
	| { readonly type: "LevelEnded"; readonly step: number };
