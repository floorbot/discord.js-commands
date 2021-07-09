import { ComponentCustomData } from '../classes/CommandClient';
import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandler {
    onSelectMenu<T, R>(interaction: SelectMenuInteraction, customData: ComponentCustomData & T): Promise<R>;
}
