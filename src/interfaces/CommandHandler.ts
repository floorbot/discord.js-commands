import { BaseHandler } from '../classes/BaseHandler';
import { CommandInteraction } from 'discord.js';

export interface CommandHandler extends BaseHandler {
    onCommand<T>(interaction: CommandInteraction): Promise<T>;
}

export function isCommandHandler(handler: any): handler is CommandHandler {
    return typeof handler.onCommand === 'function';
}
