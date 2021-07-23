import { CommandInteraction, ApplicationCommand, ApplicationCommandData, Guild } from 'discord.js';
import { BaseHandler, HandlerResult } from '../..';

export interface CommandHandler extends BaseHandler {

    readonly commandData: ApplicationCommandData;

    onCommand(interaction: CommandInteraction): Promise<HandlerResult | null | any>;
    fetchCommand(guild?: Guild): Promise<ApplicationCommand | null>;
}
