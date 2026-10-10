import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { apply_update } from "./apply-update.js";

function deviceRecord() {
    return {
        deviceId: "D01",
        siteId: "S01",
        version: 3,
        settings: {
            language: "en",
            volume: 2,
        },
    };
}

const actor = {
    siteId: "S01",
    role: "editor",
};

describe("apply_update", () => {
    it("applies a partial settings update", () => {
        const current = deviceRecord();
        const request = {
            deviceId: "D01",
            expectedVersion: 3,
            settings: {
                volume: 4,
            },
        };

        const result = apply_update(current, actor, request);

        assert.deepStrictEqual(result, {
            status: 200,
            data: {
                deviceId: "D01",
                siteId: "S01",
                version: 4,
                settings: {
                    language: "en",
                    volume: 4,
                },
            },
        });
    });

    it("rejects an update and leaves the input state unchanged", () => {
        const current = deviceRecord();
        const before = structuredClone(current);
        const request = {
            deviceId: "D01",
            expectedVersion: 2,
            settings: {
                volume: 4,
            },
        };

        const result = apply_update(current, actor, request);

        assert.deepStrictEqual(result, {
            status: 409,
            error: "CONFLICT",
        });
        assert.deepStrictEqual(current, before);
    });
});
