import { MessageSelectMenu, MessageSelectMenuOptions, MessageActionRow } from 'discord.js';
import { SelectMenuHandler } from '../interfaces/SelectMenuHandler';
import { HandlerCustomData } from '../..';

export class SelectMenuProvider<T extends HandlerCustomData, H extends SelectMenuHandler<T>> extends MessageSelectMenu {

    public readonly handler: H;

    constructor(handler: H, data?: MessageSelectMenu | MessageSelectMenuOptions) {
        super(data);
        this.handler = handler;
    };

    public override setCustomId(data: string | T): this {
        if (typeof data === 'string') return super.setCustomId(data);
        return super.setCustomId(this.handler.encodeSelectMenu(data));
    }

    public toActionRow(): MessageActionRow {
        return new MessageActionRow().addComponents(this)
    }
}
