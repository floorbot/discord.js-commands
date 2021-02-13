const exitHook = require('async-exit-hook');

module.exports = class Tracker {
    constructor(client, options = {}) {
        this.client = client;
        this.safeClose = options.safeClose ?? false;
        this.name = options.name || this.constructor.name;
        this.client.on('shardReady', (id, unavailableGuilds) => this.initialize())
        this.client.on('shardResume', (id, replayedEvents) => this.initialize())
        this.client.on('shardError', (error, shardID) => this.finalize());
        exitHook(() => {
            if (this.safeClose) {
                console.log(`Safely Closing: ${this.constructor.name}`);
                return this.finalize();
            }
        });
    }

    getHistory(member, time) {
        // Get all history for a specific member from the given time
    }

    initialize() {
        // Called when reconnecting or application starting up
    }

    finalize() {
        // Called when disconnected or application closing
    }
}
