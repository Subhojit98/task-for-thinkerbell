//? helper function
function res(status, error) {
    return { status, error };
}

const requiredKeys = [
    "deviceId",
    "expectedVersion",
    "settings",
];
const allowedSettings = new Set(["language", "volume"]);
const allowedLanguages = new Set(["en", "hi", "kn"]);

export function apply_update(current, actor, request) {
    if (
        !current ||
        typeof current !== "object" ||
        Array.isArray(current) ||
        !actor ||
        typeof actor !== "object" ||
        Array.isArray(actor)
    ) {
        return res(422, "INVALID_INPUT");
    }

    if (!request || typeof request !== "object" || Array.isArray(request)) {
        return res(422, "INVALID_INPUT");
    }

    if (actor.role !== "editor" || actor.siteId !== current.siteId) {
        return res(403, "FORBIDDEN");
    }

    const requestKeys = Object.keys(request);
    const hasRequiredKeys =
        requestKeys.length === requiredKeys.length &&

        requiredKeys.every((key) =>
            Object.prototype.hasOwnProperty.call(request, key)
        );

    if (!hasRequiredKeys) {
        return res(422, "INVALID_INPUT");
    }

    const settings = request.settings;

    if (
        typeof request.deviceId !== "string" ||
        request.deviceId.trim() === "" ||
        !Number.isInteger(request.expectedVersion) ||
        request.expectedVersion < 0 ||
        !settings ||
        typeof settings !== "object" ||
        Array.isArray(settings) ||
        Object.keys(settings).length === 0
    ) {
        return res(422, "INVALID_INPUT");
    }

    for (const key of Object.keys(settings)) {
        if (!allowedSettings.has(key)) {
            return res(422, "INVALID_INPUT");
        }
    }

    if (Object.prototype.hasOwnProperty.call(settings, "language")) {
        if (!allowedLanguages.has(settings.language)) {
            return res(422, "INVALID_INPUT");
        }
    }

    if (Object.prototype.hasOwnProperty.call(settings, "volume")) {
        const volume = settings.volume;

        if (!Number.isInteger(volume) || volume < 0 || volume > 5) {
            return res(422, "INVALID_INPUT");
        }
    }

    if (request.deviceId !== current.deviceId) {
        return res(404, "NOT_FOUND");
    }

    if (request.expectedVersion !== current.version) {
        return res(409, "CONFLICT");
    }

    const updatedRecord = {
        ...current,
        settings: {
            ...current.settings,
            ...settings,
        },
        version: current.version + 1,
    };

    return {
        status: 200,
        data: updatedRecord,
    };
}
