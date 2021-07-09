import { ComponentCustomData } from '../classes/CommandClient';
import { ButtonInteraction } from 'discord.js';

export interface ButtonHandler {
    onButton<T, R>(interaction: ButtonInteraction, customData: ComponentCustomData & T): Promise<R>;
}
