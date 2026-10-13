declare module "culori" {
	export function converter(mode: "rgb"): (color: string) =>
		| {
				r: number;
				g: number;
				b: number;
		  }
		| undefined;
}
