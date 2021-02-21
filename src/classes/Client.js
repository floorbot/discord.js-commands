module.exports = (Client) => class extends Client {
    constructor(options) {
        super(options);
        options.commands = options.commands || {};
        options.tasks = options.tasks || {};

        // Initialise the tasks
        this.tasks = Object.keys(options.tasks).reduce((tasks, key) => {
            const taskOptions = options.tasks[key].options ?? {};
            const TaskClass = options.tasks[key].class;
            tasks[key] = new TaskClass(this, taskOptions);
            return tasks;
        }, {});

        // Initialise the commands
        this.commands = Object.keys(options.commands).reduce((commands, key) => {
            const commandOptions = options.commands[key].options ?? {};
            const CommandClass = options.commands[key].class;
            commands[key] = new CommandClass(this, commandOptions);
            if (commandOptions.post) this.interactionClient.createCommand(commands[key].json)
                .then(console.log(`Successfully posted command: ${commands[key].name}`))
                .catch(error => console.error(`Failed to post command: ${commands[key].name}`, error));
            return commands;
        }, {});

        this.on('interactionCreate', (interaction) => {
            const command = this.commands?. [interaction.commandName];
            if (command) {
                return command.predicate(interaction)
                    .then(passed => { if (passed) return command.execute(interaction) })
                    .catch((error) => {
                        console.log(error);
                        return command.respond[500](interaction);
                    });
            }
        });

        this.on('message', message => {
            Object.values(this.commands).filter(command => command.regex).forEach(command => {
                const matches = command.regex.exec(message.content);
                if (matches) return command.regexecute(message, matches[1]).catch((error) => console.log(error));
            });
        });
    }
}
