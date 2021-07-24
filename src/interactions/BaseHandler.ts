import { Message, CommandInteraction, ButtonInteraction, SelectMenuInteraction, InteractionReplyOptions } from 'discord.js';
import { CommandHandler, ButtonHandler, SelectMenuHandler, RegexHandler, HandlerEmbed } from '..';
import { CommandClient } from '../discord/CommandClient';

export interface HandlerOptions {
    readonly nsfw?: boolean;
    readonly id: string;
}

export interface HandlerCustomData { [x: string]: string | number | boolean | null | undefined | HandlerCustomData | HandlerCustomDataArray }
export interface HandlerCustomDataArray extends Array<string | number | boolean | null | undefined | HandlerCustomData | HandlerCustomDataArray> { }
export interface HandlerResult { message?: string; }

export type HandlerContext = CommandInteraction | ButtonInteraction | SelectMenuInteraction | Message;

export class BaseHandler {

    public readonly nsfw: boolean;
    public readonly id: string;

    constructor(options: HandlerOptions) {
        this.nsfw = options.nsfw ?? false;
        this.id = options.id;
    }

    public async isEnabled(_context: HandlerContext): Promise<boolean> { return true; }

    public async initialise(_client: CommandClient): Promise<HandlerResult | any> { return null }
    public async finalise(_client: CommandClient): Promise<HandlerResult | any> { return null }
    public async setup(_client: CommandClient): Promise<HandlerResult | any> { return null }

    public isSelectMenuHandler(): this is SelectMenuHandler<HandlerCustomData> { return 'onSelectMenu' in this }
    public isButtonHandler(): this is ButtonHandler<HandlerCustomData> { return 'onButton' in this }
    public isCommandHandler(): this is CommandHandler { return 'onCommand' in this }
    public isRegexHandler(): this is RegexHandler { return 'onRegex' in this }

    protected getContextName(context: HandlerContext) {
        switch (true) {
            case context instanceof CommandInteraction: return 'command';
            case context instanceof ButtonInteraction: return 'button';
            case context instanceof SelectMenuInteraction: return 'select menu';
            default: throw context;
        }
    }

    public getHandlerErrorResponse(context: HandlerContext): InteractionReplyOptions {
        return new HandlerEmbed(context)
            .setDescription([
                `Sorry! I seem to have run into an issue with \`/${this.id}\``,
                `*The error has been reported and will be fixed!*`
            ].join('\n')).toReplyOptions(false);
    }

    public getHandlerDisabledResponse(context: HandlerContext): InteractionReplyOptions {
        const type = this.getContextName(context);
        return new HandlerEmbed(context).setDescription([
            `Sorry! It looks like \`/${this.id}\` \`${type}\`s are currently disabled`,
            `*If this is wrong please be patient and try again later!*`
        ].join('\n')).toReplyOptions(true);
    }

    public getHandlerNSFWResponse(context: HandlerContext): InteractionReplyOptions {
        return new HandlerEmbed(context)
            .setDescription(`*Sorry! \`/${this.id}\` commands can only be used in \`NSFW\` channels*`)
            .toReplyOptions(true);
    }
}
