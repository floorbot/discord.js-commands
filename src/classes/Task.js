const exitHook = require('async-exit-hook');
const Logger = require('./Logger');

module.exports = class Task {
    constructor(client, options = {}) {
        this.client = client;
        this.name = options.name || this.constructor.name;

        this.client.on('shardReady', (id, unavailableGuilds) => { if (this.initialise()) Logger.log(this.name, 'Initialised (Shard Ready)') })
        this.client.on('shardResume', (id, replayedEvents) => { if (this.initialise()) Logger.log(this.name, 'Initialised (Shard Resume)') })
        this.client.on('shardError', (error, shardID) => { if (this.finalise()) Logger.log(this.name, 'Finalised (Shard Error)') })
        exitHook(() => { if (this.finalise()) Logger.log(this.name, 'Finalised (Exit Hook)') });
    }

    initialise() {
        return null; // Called when reconnecting or application starting up
    }

    finalise() {
        return null; // Called when disconnected or application closing
    }
}
