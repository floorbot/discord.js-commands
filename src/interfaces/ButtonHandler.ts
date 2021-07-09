import { ComponentCustomData } from '../classes/CommandClient';
import { ButtonInteraction } from 'discord.js';

export interface ButtonHandler {
    onButton<T extends ComponentCustomData, R>(interaction: ButtonInteraction, customData: T): Promise<R>;
}
