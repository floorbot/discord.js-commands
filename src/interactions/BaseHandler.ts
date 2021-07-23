import { CommandHandler, ButtonHandler, SelectMenuHandler, RegexHandler, ResponseFactory } from '..';
import { Message, CommandInteraction, ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import { CommandClient } from '../discord/CommandClient';

export interface HandlerOptions {
    readonly nsfw: boolean;
    readonly id: string;
}

export interface HandlerCustomData { [x: string]: string | number | boolean | null | undefined | HandlerCustomData | HandlerCustomDataArray }
export interface HandlerCustomDataArray extends Array<string | number | boolean | null | undefined | HandlerCustomData | HandlerCustomDataArray> { }
export interface HandlerResult { message?: string; }

export type HandlerContext = CommandInteraction | ButtonInteraction | SelectMenuInteraction | Message;

export abstract class BaseHandler {

    public abstract readonly responseFactory: ResponseFactory<BaseHandler>;

    public readonly nsfw: boolean;
    public readonly id: string;


    constructor(options: HandlerOptions) {
        this.nsfw = options.nsfw;
        this.id = options.id;
    }

    public abstract isEnabled(context: HandlerContext): Promise<boolean>;

    public async initialise(_client: CommandClient): Promise<HandlerResult | any> { return null }
    public async finalise(_client: CommandClient): Promise<HandlerResult | any> { return null }
    public async setup(_client: CommandClient): Promise<HandlerResult | any> { return null }

    public isSelectMenuHandler(): this is SelectMenuHandler<HandlerCustomData> { return 'onSelectMenu' in this }
    public isButtonHandler(): this is ButtonHandler<HandlerCustomData> { return 'onButton' in this }
    public isCommandHandler(): this is CommandHandler { return 'onCommand' in this }
    public isRegexHandler(): this is RegexHandler { return 'onRegex' in this }
}
