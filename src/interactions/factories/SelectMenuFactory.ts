import { MessageSelectMenu, MessageSelectMenuOptions, MessageActionRow } from 'discord.js';
import { BaseFactory, SelectMenuHandler, HandlerCustomData } from '../..';

export class SelectMenuFactory<T extends HandlerCustomData, H extends SelectMenuHandler<T>> extends BaseFactory<H> {

    constructor(handler: H) {
        super(handler);
    }

    public encode(customData: T): string { return JSON.stringify(customData); }
    public decode(customString: string): T { return JSON.parse(customString); }
}

export class HandlerSelectMenu<T extends HandlerCustomData, H extends SelectMenuHandler<T>> extends MessageSelectMenu {

    public readonly handler: H;

    constructor(handler: H, data?: MessageSelectMenu | MessageSelectMenuOptions) {
        super(data);
        this.handler = handler;
    };

    public override setCustomId(data: string | T): this {
        if (typeof data === 'string') return super.setCustomId(data);
        return super.setCustomId(`${this.handler.id}-${this.handler.selectMenuFactory.encode(data)}`);
    }

    public toActionRow(): MessageActionRow {
        return new MessageActionRow().addComponents(this)
    }
}
