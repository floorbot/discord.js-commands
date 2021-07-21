import { Message, CommandInteraction, ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import { CommandHandler, ButtonHandler, SelectMenuHandler, RegexHandler } from '..';

export interface HandlerOptions {
    readonly id: string;
}

export interface HandlerCustomData { [x: string]: string | number | boolean | null | undefined | HandlerCustomData | HandlerCustomDataArray }
export interface HandlerCustomDataArray extends Array<string | number | boolean | null | undefined | HandlerCustomData | HandlerCustomDataArray> { }
export interface HandlerResult { message?: string; }

export type HandlerContext = CommandInteraction | ButtonInteraction | SelectMenuInteraction | Message;

export class BaseHandler {

    public readonly id: string;

    constructor(options: HandlerOptions) {
        this.id = options.id;
    }

    public async initialise(): Promise<HandlerResult | null> { return null }
    public async finalise(): Promise<HandlerResult | null> { return null }
    public async setup(): Promise<HandlerResult | null> { return null }

    public isSelectMenuHandler(): this is SelectMenuHandler<HandlerCustomData> { return 'onSelectMenu' in this }
    public isButtonHandler(): this is ButtonHandler<HandlerCustomData> { return 'onButton' in this }
    public isCommandHandler(): this is CommandHandler { return 'onCommand' in this }
    public isRegexHandler(): this is RegexHandler { return 'onRegex' in this }
}
