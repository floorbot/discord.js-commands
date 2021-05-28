module.exports = class Task {
    constructor(client, options = {}) {
        this.client = client;
        this.group = options.group ?? null;
        this.name = options.name || this.constructor.name;
    }

    // Called when reconnecting or application starting up
    initialise() { return null; }

    // Called when disconnected or application closing
    finalise() { return null; }
}
