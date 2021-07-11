import { BaseHandler } from '../classes/BaseHandler';
import { ApplicationCommand } from 'discord.js';

export interface CommandEventHandler extends BaseHandler {
    onCommandCreate<T>(command: ApplicationCommand): Promise<T>;
    onCommandUpdate<T>(oldCommand: ApplicationCommand | null, newCommand: ApplicationCommand): Promise<T>;
    onCommandDelete<T>(command: ApplicationCommand): Promise<T>;
}
