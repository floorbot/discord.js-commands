const Logger = require('./Logger');

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
                .then(Logger.log(commands[key].name, 'Successfully posted command'))
                .catch(error => Logger.error(commands[key].name, ['Failed to post command', error]));
            return commands;
        }, {});

        // Interaction command triggers
        this.on('interactionCreate', (interaction) => {

            // These are temporary solutions to change later
            interaction.replyEphemeral = (content) => {
                return interaction.client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: { type: 3, data: { flags: 64, content: content } }
                })
            }
            interaction.replyContent = (content) => {
                return interaction.client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: { type: 3, data: { content: content } }
                })
            }
            interaction.replyData = (data) => {
                return interaction.client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: { type: 3, data: data }
                })
            }
            interaction.replyWait = () => {
                return interaction.client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: { type: 2 }
                })
            }
            interaction.editData = (data) => {
                return interaction.client.api['webhooks'][interaction.client.applicationID][interaction.token]['messages']['@original'].patch({
                    data: data
                })
            }
            interaction.replyFollowup = (data) => {
                return interaction.client.api['webhooks'][interaction.client.applicationID][interaction.token].post({
                    data: data
                })
            }

            const startTime = Date.now();
            const command = this.commands[interaction.commandName];
            if (command) {
                new Promise((resolve, reject) => {
                    const { channel, member } = interaction;
                    if (!command.allowDM && !member) return resolve(interaction.replyEphemeral(`*Sorry! \`/${command.name}\` can only be used in guilds 😒*`)).then(false);
                    if (member && !channel.permissionsFor(member).has(command.permissions)) return resolve(interaction.replyEphemeral(`*Sorry! You do not have permission to use \`/${command.name}\` 😑*`)).then(false);
                    if (member && command.nsfw && !channel.nsfw) return resolve(interaction.replyEphemeral(`*Sorry! \`/${command.name}\` can only be used in \`NSFW\` channels 😏*`)).then(false);
                    return resolve(true);
                }).then(passed => {
                    if (passed) return command.execute(interaction);
                }).catch((error) => {
                    Logger.error(command.name, error)
                    return interaction.replyContent(`*Sorry! I seem to have run into an issue with \`/${command.name}\` 😵*`);
                }).finally(() => {
                    Logger.log(command.name, ['Executed interaction in', Date.now() - startTime, 'milliseconds'])
                });
            }
        });

        // Regex triggers on messages
        this.on('message', message => {
            const startTime = Date.now();
            const { channel, guild, member } = message;
            Object.values(this.commands).filter(command => command.regex).forEach(command => {
                const matches = command.regex.exec(message.content);
                if (matches) {
                    new Promise((resolve, reject) => {
                        if (guild && !channel.permissionsFor(guild.me).has('SEND_MESSAGES')) return resolve(false);
                        if (!command.allowDM && !guild) return resolve(message.reply(`*Sorry! \`/${command.name}\` can only be used in guilds 😒*`)).then(false);
                        if (member && !channel.permissionsFor(member).has(command.permissions)) return resolve(message.reply(`*Sorry! You do not have permission to use \`/${command.name}\` 😑*`)).then(false);
                        if (guild && command.nsfw && !channel.nsfw) return resolve(message.reply(`*Sorry! \`/${command.name}\` can only be used in \`NSFW\` channels 😏*`)).then(false);
                        return resolve(true);
                    }).then(passed => {
                        if (passed) return command.regexecute(message, matches[1]);
                    }).catch((error) => {
                        Logger.error(command.name, error)
                        return message.reply(`*Sorry! I seem to have run into an issue with \`${command.name}\` 😵*`);
                    }).finally(() => {
                        Logger.log(command.name, ['Executed regex in', Date.now() - startTime, 'milliseconds'])
                    });
                }
            });
        });
    }
}
