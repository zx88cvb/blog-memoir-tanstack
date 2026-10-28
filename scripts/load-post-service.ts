import { registerHooks } from "node:module";

/** Resolve the one build-generated Vite alias in native Node regression tests. */
export async function loadPostService() {
	const hooks = registerHooks({
		resolve(specifier, context, nextResolve) {
			if (specifier === "content-collections")
				return {
					url: new URL(
						"../.content-collections/generated/index.js",
						import.meta.url,
					).href,
					shortCircuit: true,
				};
			return nextResolve(specifier, context);
		},
	});
	try {
		return await import("../src/modules/post/service.ts");
	} finally {
		hooks.deregister();
	}
}
