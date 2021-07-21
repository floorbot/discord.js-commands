import { CommandInteraction, ApplicationCommandData } from 'discord.js';
import { BaseHandler, HandlerResult } from '../BaseHandler';

export interface CommandHandler extends BaseHandler {

    readonly commandData: ApplicationCommandData;
    readonly isGlobal: boolean;

    onCommand(interaction: CommandInteraction): Promise<HandlerResult | null>;
}
