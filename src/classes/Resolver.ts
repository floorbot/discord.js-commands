import { User, GuildMember, Role, Guild, Message, GuildChannel, Channel, DMChannel, Client } from 'discord.js';
import { HandlerContext } from './BaseHandler';
import * as twemoji from 'twemoji';

export enum ResolverType {
    EMOJI = 'emoji',
    USER = 'user',
    MEMBER = 'member',
    ROLE = 'role'
}

export interface ResolverResponse {
    readonly emoji?: { string: string, imageURL: string },
    readonly member?: GuildMember,
    readonly user?: User,
    readonly role?: Role,
}

export class Resolver {

    public static async resolve(context: HandlerContext, type: ResolverType | Array<ResolverType>, string: string, bot: boolean = true): Promise<ResolverResponse> {
        const user = context instanceof Message ? context.author : context.user;
        const { member, guild, channel, client } = <{
            member: GuildMember | undefined,
            guild: Guild | undefined,
            channel: Channel,
            client: Client,
        }>context;

        if (Array.isArray(type)) {
            const res = {};
            for (const typeSingle of type) {
                const resolved = await Resolver.resolve(context, typeSingle, string, bot);
                Object.assign(res, resolved);
            }
            return res;
        }

        if (!string.length) return {};
        string = string.toLowerCase();
        switch (type) {
            case ResolverType.EMOJI: {
                const png = /<:[^:]+:(\d+)>/g.exec(string);
                if (png) return { emoji: { string: string, imageURL: `https://cdn.discordapp.com/emojis/${png[1]}.png` } };
                const gif = /<a:[^:]+:(\d+)>/g.exec(string);
                if (gif) return { emoji: { string: string, imageURL: `https://cdn.discordapp.com/emojis/${gif[1]}.gif` } };
                const svg = twemoji.parse(string, { folder: 'svg', ext: '.svg' }).match(/(http(s?):)([^\s])*\.svg/);
                if (svg) return { emoji: { string: string, imageURL: svg[0] } };
                break;
            }
            case ResolverType.USER: {
                if (string === 'me') return { user };
                if (!guild && channel instanceof DMChannel) {
                    if (channel.recipient.tag.toLowerCase().includes(string)) return { user };
                    if (bot && client.user && client.user.tag.toLowerCase().includes(string)) return { user: client.user };
                    break;
                }
                if (!guild || !(channel instanceof GuildChannel)) break;
                for (let m of channel.members.values()) {
                    if (!bot && user.bot) continue;
                    const testMention = m.toString() === string;
                    const testUsername = user.tag.toLowerCase().includes(string);
                    const testDisplayName = m.displayName.toLowerCase().includes(string);
                    if (testMention || testUsername || testDisplayName) return { user: m.user };
                }
                break;
            }
            case ResolverType.MEMBER: {
                if (!guild || !(channel instanceof GuildChannel)) break;
                if (string === 'me') return { member };
                for (let m of channel.members.values()) {
                    if (!bot && user.bot) continue;
                    const testMention = m.toString() === string;
                    const testUsername = user.tag.toLowerCase().includes(string);
                    const testDisplayName = m.displayName.toLowerCase().includes(string);
                    if (testMention || testUsername || testDisplayName) return { member: m };
                }
                break;
            }
            case ResolverType.ROLE: {
                if (!guild) break;
                for (let role of guild.roles.cache.values()) {
                    const testName = role.name.toLowerCase().includes(string);
                    const testMention = role.toString().includes(string);
                    if (testName || testMention) return { role };
                }
                break;
            }
            default: { break; }
        }
        return {};
    }
}
