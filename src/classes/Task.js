const exitHook = require('async-exit-hook');

module.exports = class Task {
    constructor(client, options = {}) {
        this.client = client;
        this.safeClose = options.safeClose ?? false;
        this.name = options.name || this.constructor.name;
        if (this.safeClose) {
            this.client.on('shardReady', (id, unavailableGuilds) => this.initialize())
            this.client.on('shardResume', (id, replayedEvents) => this.initialize())
            this.client.on('shardError', (error, shardID) => this.finalize());
            exitHook(() => {
                console.log(`Safely Closing Task: ${this.constructor.name}`);
                return this.finalize();
            });
        }
    }

    initialize() {
        // Called when reconnecting or application starting up
    }

    finalize() {
        // Called when disconnected or application closing
    }
}
