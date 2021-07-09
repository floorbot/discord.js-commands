import { BaseHandler } from '../classes/BaseHandler';
import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandler extends BaseHandler {
    onSelectMenu<T>(interaction: SelectMenuInteraction, customData: ButtonCustomData): Promise<T>;
}

export interface ButtonCustomData {
    readonly id: string
}

export function isSelectMenuHandler(handler: any): handler is SelectMenuHandler {
    return typeof handler.onSelectMenu === 'function';
}
