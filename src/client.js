module.exports = (Client) => class extends Client {
    constructor(options) {
        super(options);
        this.commands = {};
        this.trackers = {};
        this.on('interactionCreate', (interaction) => {
            const command = this.commands?. [interaction.commandName];
            if (command) {
                return command.predicate(interaction)
                    .then(passed => { if (passed) return command.execute(interaction) })
                    .catch((error) => command.failed(interaction, error));
            }
        });
        this.on('message', message => {
            Object.values(this.commands).filter(command => command.regex).forEach(command => {
                const matches = command.regex.exec(message.content);
                if (matches) return command.regexecute(message, matches[1]);
            });
        });
    }

    registerCommand(commands, post = false) {
        [commands].flat().forEach(command => {
            this.commands[command.json.name] = command;
            if (post) this.interactionClient.createCommand(command.json).catch(console.error);
        });
        return this;
    }

    registerTracker(trackers) {
        [trackers].flat().forEach(tracker => {
            this.trackers[tracker.name] = tracker;
        });
        return this;
    }
}
