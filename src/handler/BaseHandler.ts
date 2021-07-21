import { Message, Guild, ApplicationCommand, CommandInteraction, ButtonInteraction, SelectMenuInteraction, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { SelectMenuHandler } from './interfaces/SelectMenuHandler';
import { CommandHandler } from './interfaces/CommandHandler';
import { ButtonHandler } from './interfaces/ButtonHandler';
import { EmbedProvider } from './providers/EmbedProvider';
import { RegexHandler } from './interfaces/RegexHandler';
import { CommandClient } from '../discord/CommandClient';

export interface HandlerOptions {
    readonly id: string;
    readonly name: string;
    readonly group: string;
    readonly nsfw: boolean;
}

export interface HandlerCustomData { [x: string]: string | number | boolean | null | HandlerCustomData | HandlerCustomDataArray }
export interface HandlerCustomDataArray extends Array<string | number | boolean | null | HandlerCustomData | HandlerCustomDataArray> { }
export interface HandlerResult { message?: string; }

export type HandlerContext = CommandInteraction | ButtonInteraction | SelectMenuInteraction | Message;

export abstract class BaseHandler {

    public readonly client: CommandClient;
    public readonly id: string;
    public readonly name: string;
    public readonly group: string;
    public readonly nsfw: boolean;

    constructor(client: CommandClient, options: HandlerOptions) {
        this.client = client;
        this.id = options.id;
        this.name = options.name;
        this.group = options.group;
        this.nsfw = options.nsfw;
    }

    public getEmbedTemplate(context: HandlerContext, data?: MessageEmbed | MessageEmbedOptions): EmbedProvider {
        return new EmbedProvider(context, data);
    }

    public abstract isEnabled(guild?: Guild): Promise<boolean>;
    public abstract enable(guild?: Guild): Promise<ApplicationCommand | null>;
    public abstract disable(guild?: Guild): Promise<ApplicationCommand | null>;
    public abstract hasPermission(context: HandlerContext): Promise<boolean>;
    public abstract fetchCommand(guild?: Guild): Promise<ApplicationCommand | null>;

    public async initialise(): Promise<HandlerResult | null> { return null }
    public async finalise(): Promise<HandlerResult | null> { return null }
    public async setup(): Promise<HandlerResult | null> { return null }

    public isSelectMenuHandler(): this is SelectMenuHandler<HandlerCustomData> { return 'onSelectMenu' in this }
    public isButtonHandler(): this is ButtonHandler<HandlerCustomData> { return 'onButton' in this }
    public isCommandHandler(): this is CommandHandler { return 'onCommand' in this }
    public isRegexHandler(): this is RegexHandler { return 'onRegex' in this }
}
