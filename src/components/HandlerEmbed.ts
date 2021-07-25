import { MessageEmbed, MessageEmbedOptions, InteractionReplyOptions, Message, GuildMember } from 'discord.js'
import { HandlerContext } from '../..';

export class HandlerEmbed extends MessageEmbed {

    constructor(data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
    }

    public setContextAuthor(context: HandlerContext): this {
        const { member } = context;
        const user = context instanceof Message ? context.author : context.user;
        if (member && member instanceof GuildMember) {
            this.setAuthor(member.displayName, user.displayAvatarURL());
            this.setColor(member.displayColor || 14840969);
        } else {
            this.setAuthor(user.username, user.displayAvatarURL());
            this.setColor(14840969);
        }
        return this;
    }

    public toReplyOptions(ephemeral?: boolean): InteractionReplyOptions {
        return { embeds: [this], ephemeral: ephemeral ?? false }
    }
}
