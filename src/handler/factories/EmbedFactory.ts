import { MessageEmbed, MessageEmbedOptions, Message, GuildMember, InteractionReplyOptions, CommandInteraction } from 'discord.js'
import { BaseHandler, HandlerContext } from '../..';

export class EmbedFactory extends MessageEmbed {

    constructor(context: HandlerContext, data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
        const { member } = context;
        const user = context instanceof Message ? context.author : context.user;
        if (member && member instanceof GuildMember) {
            this.setAuthor(member.displayName, user.displayAvatarURL());
            this.setColor(member.displayColor || 14840969);
        } else {
            this.setAuthor(user.username, user.displayAvatarURL());
            this.setColor(14840969);
        }
    }

    public static getErrorEmbed(context: HandlerContext, handler: BaseHandler): EmbedFactory {
        return new EmbedFactory(context)
            .setDescription([
                `Sorry! I seem to have run into an issue with \`/${handler.id}\` 😵`,
                `*The error has been reported and will be fixed!*`
            ].join('\n'));
    }

    public static getNSFWEmbed(context: HandlerContext, handler: BaseHandler): EmbedFactory {
        return new EmbedFactory(context)
            .setDescription(`*Sorry! \`/${handler.id}\` commands can only be used in \`NSFW\` channels 😏*`);
    }

    public static getForbiddenEmbed(context: HandlerContext, handler: BaseHandler, reason: string) {
        const type = context instanceof CommandInteraction ? 'command' : 'component';
        return new EmbedFactory(context)
            .setDescription([
                `Sorry! You do not have permission to use this ${handler.id} ${type}!`,
                `*${reason}*`
            ].join('\n'));
    }

    public toReplyOptions(ephemeral?: boolean): InteractionReplyOptions {
        return { embeds: [this], ephemeral: ephemeral ?? false }
    }
}
