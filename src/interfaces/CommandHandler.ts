import { CommandInteraction, ApplicationCommandData } from 'discord.js';
import { BaseHandler } from '../classes/BaseHandler';

export interface CommandHandler extends BaseHandler {

    readonly commandData: ApplicationCommandData;
    readonly isGlobal: boolean;

    onCommand<T>(interaction: CommandInteraction): Promise<T>;
}

export function isCommandHandler(handler: any): handler is CommandHandler {
    return typeof handler.onCommand === 'function';
}
