import { Client, ClientOptions, Constants, CloseEvent, Message, Interaction, BaseCommandInteraction, MessageComponentInteraction, TextChannel } from 'discord.js';
import { CommandHandler, ComponentHandler, BaseHandler, HandlerCustomData } from '..';
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
    }

    private async onInteractionCreate(interaction: Interaction): Promise<any> {
        const { channel } = interaction;

        if (interaction instanceof BaseCommandInteraction) {
            const handler = this.handlers.find(handler => handler.isBaseCommandHandler() && handler.id === interaction.commandName) as (CommandHandler | undefined);
            if (handler) {
                if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) return handler.onNSFW(interaction);
                return handler.onCommand(interaction).then(result => {
                    if (result) this.emit('log', `[${handler.id}](command){${Date.now() - interaction.createdTimestamp}ms} ${result.message || 'Completed'}`);
                }).catch(error => {
                    this.emit('log', `[${handler.id}](command){${Date.now() - interaction.createdTimestamp}ms} Encountered an error`, error);
                    return handler.onError(interaction);
                }).catch(console.error);
            }
        }

        if (interaction instanceof MessageComponentInteraction) {
            const [commandName, customDataString] = interaction.customId.split(/-(.+)/);
            if (commandName && customDataString) {
                const handler = this.handlers.find(handler => handler.isComponentHandler() && handler.id === commandName) as (ComponentHandler<HandlerCustomData> | undefined);
                if (handler) {
                    const customData = handler.decodeComponent(customDataString);
                    if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) return handler.onNSFW(interaction, customData);
                    return handler.onComponent(interaction, customData).then(result => {
                        if (result) this.emit('log', `[${handler.id}](button){${Date.now() - interaction.createdTimestamp}ms} ${result.message || 'Completed'}`);
                    }).catch(error => {
                        this.emit('log', `[${handler.id}](button){${Date.now() - interaction.createdTimestamp}ms} Encountered an error`, error);
                        return handler.onError(interaction, customData);
                    }).catch(console.error);
                }
            }
        }
    }

    private async onMessageCreate(message: Message): Promise<void> {
        const { channel } = message;
        for (const handler of this.handlers) {
            if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) return;
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
                        return handler.onError(message);
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
            this.on(Events.SHARD_READY, this.onShardReady);
            this.on(Events.SHARD_RESUME, this.onShardResume);
            this.on(Events.SHARD_DISCONNECT, this.onShardDisconnect);
            this.on(Events.SHARD_ERROR, this.onShardError);
            exitHook((done) => this.onExitHook(done));
            this.on(Events.INTERACTION_CREATE, this.onInteractionCreate);
            this.on(Events.MESSAGE_CREATE, this.onMessageCreate);
            this.emit('log', `[login] Logged in as <${this.user!.tag}> and listening for events`);
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
