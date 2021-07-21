import { CommandInteraction, ApplicationCommandData } from 'discord.js';
import { BaseHandler, HandlerResult } from '../..';

export interface CommandHandler extends BaseHandler {

    readonly commandData: ApplicationCommandData;
    readonly nsfw: boolean;

    onCommand(interaction: CommandInteraction): Promise<HandlerResult | null | any>;
}
