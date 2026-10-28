import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { copyText } from "../src/lib/clipboard.ts";

const navigatorDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	"navigator",
);
const documentDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	"document",
);
afterEach(() => {
	for (const [name, descriptor] of [
		["navigator", navigatorDescriptor],
		["document", documentDescriptor],
	] as const) {
		if (descriptor) Object.defineProperty(globalThis, name, descriptor);
		else Reflect.deleteProperty(globalThis, name);
	}
});

test("copy uses Clipboard API and propagates permission failure", async () => {
	let copied = "";
	Object.defineProperty(globalThis, "navigator", {
		configurable: true,
		value: {
			clipboard: {
				writeText: async (value: string) => {
					copied = value;
				},
			},
		},
	});
	await copyText("https://example.com/posts/test");
	assert.equal(copied, "https://example.com/posts/test");
	Object.defineProperty(globalThis, "navigator", {
		configurable: true,
		value: {
			clipboard: {
				writeText: async () => {
					throw new Error("Permission denied");
				},
			},
		},
	});
	await assert.rejects(copyText("link"), /Permission denied/);
});

test("legacy copy selects a temporary textarea and restores focus on success and failure", async () => {
	Object.defineProperty(globalThis, "navigator", {
		configurable: true,
		value: {},
	});
	for (const success of [true, false]) {
		const calls: string[] = [];
		const textarea = {
			value: "",
			style: {},
			focus: () => calls.push("focus"),
			select: () => calls.push("select"),
			remove: () => calls.push("remove"),
		};
		Object.defineProperty(globalThis, "document", {
			configurable: true,
			value: {
				activeElement: { focus: () => calls.push("restore") },
				createElement: (tag: string) => {
					assert.equal(tag, "textarea");
					return textarea;
				},
				body: { appendChild: () => calls.push("append") },
				execCommand: (command: string) => {
					assert.equal(command, "copy");
					calls.push("copy");
					return success;
				},
			},
		});
		if (success) await copyText("fallback link");
		else await assert.rejects(copyText("fallback link"), /Copy failed/);
		assert.equal(textarea.value, "fallback link");
		assert.deepEqual(calls, [
			"append",
			"focus",
			"select",
			"copy",
			"remove",
			"restore",
		]);
	}
});
