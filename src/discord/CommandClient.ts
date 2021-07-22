import { Client, ClientOptions, Constants, CloseEvent, Message, Interaction, CommandInteraction, ButtonInteraction, SelectMenuInteraction, TextChannel } from 'discord.js';
import { EmbedFactory, CommandHandler, ButtonHandler, SelectMenuHandler, BaseHandler, HandlerCustomData } from '..';
import * as exitHook from 'async-exit-hook';
const { Events } = Constants;

export interface CommandClientOptions extends ClientOptions {
    readonly handlers: Array<BaseHandler>;
}

export class CommandClient extends Client {

    public readonly handlers: Array<BaseHandler>;

    constructor(options: CommandClientOptions) {
        super(options);

        this.handlers = options.handlers;

        this.on(Events.SHARD_READY, this.onShardReady);
        this.on(Events.SHARD_RESUME, this.onShardResume);
        this.on(Events.SHARD_DISCONNECT, this.onShardDisconnect);
        this.on(Events.SHARD_ERROR, this.onShardError);
        exitHook((done) => this.onExitHook(done));

        this.on(Events.INTERACTION_CREATE, this.onInteractionCreate);
        this.on(Events.MESSAGE_CREATE, this.onMessageCreate);
    }

    private async onInteractionCreate(interaction: Interaction): Promise<any> {
        const { channel } = interaction;

        if (interaction instanceof CommandInteraction) {
            const handler = this.handlers.find(handler => handler.isCommandHandler() && handler.id === interaction.commandName) as (CommandHandler | undefined)
            if (handler) {
                if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) {
                    const embed = EmbedFactory.getNSFWEmbed(interaction, handler);
                    return interaction.reply(embed.toReplyOptions(true));
                }
                return handler.onCommand(interaction).then(result => {
                    if (result) this.emit('log', `[${handler.id}](command){${Date.now() - interaction.createdTimestamp}ms} ${result.message || 'Completed'}`);
                }).catch(error => {
                    this.emit('log', `[${handler.id}](command){${Date.now() - interaction.createdTimestamp}ms} Encountered an error`, error);
                    const embed = EmbedFactory.getErrorEmbed(interaction, handler);
                    return interaction.followUp(embed.toReplyOptions());
                }).catch(console.error);
            }
        }

        if (interaction instanceof ButtonInteraction) {
            const [commandName, customDataString] = interaction.customId.split(/-(.+)/);
            if (commandName && customDataString) {
                const handler = this.handlers.find(handler => handler.isButtonHandler() && handler.id === commandName) as (ButtonHandler<HandlerCustomData> | undefined)
                if (handler) {
                    const customData = handler.decodeButton(customDataString);
                    return handler.onButton(interaction, customData).then(result => {
                        if (result) this.emit('log', `[${handler.id}](button){${Date.now() - interaction.createdTimestamp}ms} ${result.message || 'Completed'}`);
                    }).catch(error => {
                        this.emit('log', `[${handler.id}](button){${Date.now() - interaction.createdTimestamp}ms} Encountered an error`, error);
                        const embed = EmbedFactory.getErrorEmbed(interaction, handler);
                        return interaction.followUp(embed.toReplyOptions());
                    }).catch(console.error);
                }
            }
        }

        if (interaction instanceof SelectMenuInteraction) {
            const [commandName, customDataString] = interaction.customId.split(/-(.+)/);
            if (commandName && customDataString) {
                const handler = this.handlers.find(handler => handler.isButtonHandler() && handler.id === commandName) as (SelectMenuHandler<HandlerCustomData> | undefined)
                if (handler) {
                    const customData = handler.decodeSelectMenu(customDataString);
                    return handler.onSelectMenu(interaction, customData).then(result => {
                        if (result) this.emit('log', `[${handler.id}](selectmenu){${Date.now() - interaction.createdTimestamp}ms} ${result.message || 'Completed'}`);
                    }).catch(error => {
                        this.emit('log', `[${handler.id}](selectmenu){${Date.now() - interaction.createdTimestamp}ms} Encountered an error`, error);
                        const embed = EmbedFactory.getErrorEmbed(interaction, handler);
                        return interaction.followUp(embed.toReplyOptions());
                    }).catch(console.error);
                }
            }
        }
    }

    private async onMessageCreate(message: Message): Promise<void> {
        for (const handler of this.handlers) {
            if (handler.isRegexHandler()) {
                const matches = handler.regex.exec(message.content);
                if (matches && matches[1]) {
                    const { channel, guild } = message;
                    if (channel instanceof TextChannel) {
                        if (guild && (!guild.me || !channel.permissionsFor(guild.me).has('SEND_MESSAGES'))) return;
                        if (handler.nsfw && !channel.nsfw) return;
                    }
                    handler.onRegex(message, matches[1]).then(result => {
                        if (result) this.emit('log', `[${handler.id}](regex){${Date.now() - message.createdTimestamp}ms} ${result.message}`);
                    }).catch(error => {
                        this.emit('log', `[${handler.id}](regex){${Date.now() - message.createdTimestamp}ms} Encountered an error`, error);
                        const embed = EmbedFactory.getErrorEmbed(message, handler);
                        return message.reply(embed.toReplyOptions());
                    }).catch(console.error);
                }
            }
        }
    }

    public override async login(token?: string): Promise<string> {
        for (const handler of this.handlers) {
            const setup = await handler.setup(this);
            if (setup) this.emit('log', `[login](${handler.id}) ${setup.message || 'Setup complete'}`);
        }
        return super.login(token).then((string: string) => {
            this.emit('log', `[login] Logged in as <${this.user!.tag}>`)
            return string;
        });
    }

    private async onShardReady(id: number, unavailableGuilds: Set<string> | undefined): Promise<void> {
        this.emit('log', `[shard-ready] Shard ${id} ready with ${unavailableGuilds ? unavailableGuilds.size : 0} unavailable guilds`);
        for (const handler of this.handlers) {
            const initialise = await handler.initialise(this);
            if (initialise) this.emit('log', `[shard-ready](${handler.id}) ${initialise.message || 'Initialised'}`);
        }
    }

    private async onShardResume(id: number, replayedEvents: number): Promise<void> {
        this.emit('log', `[shard-resume] Shard ${id} resumed with ${replayedEvents} replayed events`);
        for (const handler of this.handlers) {
            const initialise = await handler.initialise(this);
            if (initialise) this.emit('log', `[shard-resume](${handler.id}) ${initialise.message || 'Initialised'}`);
        }
    }

    private async onShardDisconnect(event: CloseEvent, id: number): Promise<void> {
        this.emit('log', `[shard-disconnect] Shard ${id} disconnected`, event);
        for (const handler of this.handlers) {
            const finalise = await handler.finalise(this);
            if (finalise) this.emit('log', `[shard-disconnect](${handler.id}) ${finalise.message || 'Finalised'}`);
        }
    }

    private async onShardError(error: Error, id: number): Promise<void> {
        this.emit('log', `[shard-error] Shard ${id} encountered an error`, error);
        for (const handler of this.handlers) {
            const finalise = await handler.finalise(this);
            if (finalise) this.emit('log', `[shard-error](${handler.id}) ${finalise.message || 'Finalised'}`);
        }
    }

    private async onExitHook(done: () => void): Promise<void> {
        this.emit('log', '[exit-hook] Finalising all handlers before exiting');
        for (const handler of this.handlers) {
            const finalise = await handler.finalise(this);
            if (finalise) this.emit('log', `[exit-hook](${handler.id}) ${finalise.message || 'Finalised'}`);
        }
        this.destroy();
        return done();
    }
}
