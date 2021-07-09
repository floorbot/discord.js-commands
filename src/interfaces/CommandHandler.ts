import { CommandInteraction, ApplicationCommandData } from 'discord.js';

export interface CommandHandler {

    readonly commandData: ApplicationCommandData;
    readonly isGlobal: boolean;

    onCommand<T>(interaction: CommandInteraction): Promise<T>;
}
