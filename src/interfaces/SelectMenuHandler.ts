import { ComponentCustomData } from '../classes/CommandClient';
import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandler {
    onSelectMenu<T extends ComponentCustomData, R>(interaction: SelectMenuInteraction, customData: T): Promise<R>;
}
