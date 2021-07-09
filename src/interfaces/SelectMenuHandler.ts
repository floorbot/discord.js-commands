import { BaseHandler } from '../classes/BaseHandler';
import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandler extends BaseHandler {
    onSelectMenu<T>(interaction: SelectMenuInteraction, customData: SelectMenuCustomData): Promise<T>;
}

export interface SelectMenuCustomData {
    readonly id: string
}

export function isSelectMenuHandler(handler: any): handler is SelectMenuHandler {
    return typeof handler.onSelectMenu === 'function';
}
