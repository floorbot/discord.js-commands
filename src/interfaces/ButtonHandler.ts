import { ComponentCustomData } from '../classes/CommandClient';
import { BaseHandler } from '../classes/BaseHandler';
import { ButtonInteraction } from 'discord.js';

export interface ButtonHandler extends BaseHandler {
    onButton<T extends ComponentCustomData, R>(interaction: ButtonInteraction, customData: T): Promise<R>;
}
