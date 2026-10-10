import assert from "node:assert/strict";
import test from "node:test";
import { apply_update } from "./apply-update.js";

const actor = {
    siteId: "S01",
    role: "editor",
};

test("saves a volume change and keeps the language", () => {
    const current = {
        deviceId: "D01",
        siteId: "S01",
        version: 3,
        settings: {
            language: "en",
            volume: 2,
        },
    };

    const request = {
        deviceId: "D01",
        expectedVersion: 3,
        settings: {
            volume: 4,
        },
    };

    const result = apply_update(current, actor, request);

    assert.equal(result.status, 200);
    assert.equal(result.data.version, 4);
    assert.equal(result.data.settings.volume, 4);
    assert.equal(result.data.settings.language, "en");
});

// expectedVersion is 2, but the device is on version 3, so reject it
test("rejects an old version and does not change the device", () => {
    const current = {
        deviceId: "D01",
        siteId: "S01",
        version: 3,
        settings: {
            language: "en",
            volume: 2,
        },
    };

    const deviceBeforeSave = {
        deviceId: "D01",
        siteId: "S01",
        version: 3,
        settings: {
            language: "en",
            volume: 2,
        },
    };

    const request = {
        deviceId: "D01",
        expectedVersion: 2,
        settings: {
            volume: 4,
        },
    };

    const result = apply_update(current, actor, request);

    assert.equal(result.status, 409);
    assert.equal(result.error, "CONFLICT");
    assert.deepStrictEqual(current, deviceBeforeSave);
});
