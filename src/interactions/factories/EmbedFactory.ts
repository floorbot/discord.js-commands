import { MessageEmbed, MessageEmbedOptions, InteractionReplyOptions } from 'discord.js'
import { BaseFactory, BaseHandler, HandlerContext } from '../..';

export class EmbedFactory<H extends BaseHandler> extends BaseFactory<H> {

    constructor(handler: H) {
        super(handler);
    }
}

export class HandlerEmbed extends MessageEmbed {

    public readonly context: HandlerContext;

    constructor(context: HandlerContext, data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
        this.context = context;
    }

    public toReplyOptions(ephemeral?: boolean): InteractionReplyOptions {
        return { embeds: [this], ephemeral: ephemeral ?? false }
    }
}
