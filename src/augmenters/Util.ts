import { Util, Collection, User, Guild, GuildMember, TextChannel, DMChannel, Role, Interaction, Message } from 'discord.js';
import twemoji = require('twemoji');

declare module 'discord.js' {
    export namespace Util {
        export function resolveEmoji(string: string): string;
        export function resolveRole(context: Interaction | Message, string: string): Role;
        export function resolveUser(context: Interaction | Message, string: string, allowBot?: boolean): User;
        export function resolveMember(context: Interaction | Message, string: string, allowBot?: boolean): GuildMember;
        export function localeToEmoji(countryCode: string): string;
        export function getRandomUser(channel: TextChannel, bot?: boolean): GuildMember;
        export function getRandomRole(guild: Guild): Role;
        export function propTotal<T>(objects: Array<T>, property: string): number;
        export function propAverage<T>(objects: Array<T>, property: string): number;
        export function arrayFrequency(array: Array<any>): object;
        export function arrayMode(array: Array<any>): object;
        export function capitalizeString(string: string): string;
        export function formatString(string: string, fill: Array<string>): string;
        export function formatDecimal(number: number, significance?: number): string;
        export function formatCommas(number: number): string;
        export function formatDate(date: Date | string, options?: FormatDateOptions): string;
    }
}

Util.resolveEmoji = function(string: string): string {
    const emojiDefault = twemoji.parse(string).match(/(src=\"http(s?):)([^\s])*\.(?:jpg|gif|png)/g);
    if (emojiDefault) return string;
    const emojiCustom = string.match(/<a?:[^:]+:(\d+)>/g);
    if (emojiCustom && emojiCustom.length) emojiCustom[0];
    return null
}

Util.resolveRole = function(context: Interaction | Message, string: string): Role {
    const { channel } = context;
    if (channel instanceof TextChannel) {
        const { guild } = channel;
        return guild.roles.cache.find((role: Role) => {
            const testName: boolean = role.name.toLowerCase().includes(string);
            const testMention: boolean = role.toString().includes(string);
            return testName || testMention;
        }) || null;
    }
    return null;
}

Util.resolveUser = function(context: Interaction | Message, string: string, allowBot: boolean = false): User {
    const user = context instanceof Message ? context.author : context.user;
    const { channel, client } = context;
    if (string === 'me' && (allowBot || !user.bot)) return user;
    if (channel instanceof DMChannel) {
        if (channel.recipient.tag.toLowerCase().includes(string)) return user;
        if (allowBot && client.user.tag.toLowerCase().includes(string)) return client.user;
    }
    if (channel instanceof TextChannel) {
        const member = channel.members.find((member: GuildMember) => {
            if (!allowBot && member.user.bot) return false;
            const testMention: boolean = member.toString() === string;
            const testUsername: boolean = member.user.tag.toLowerCase().includes(string);
            const testDisplayName: boolean = member.displayName.toLowerCase().includes(string);
            return testMention || testUsername || testDisplayName;
        })
        if (member) return member.user;
    }
    return null;
}

Util.resolveMember = function(context: Interaction | Message, string: string, allowBot: boolean = false): GuildMember {
    const { channel, member } = context;
    if (channel instanceof TextChannel) {
        if (string === 'me' && (allowBot || !member.user.bot)) return <GuildMember>member;
        return channel.members.find((member: GuildMember) => {
            if (!allowBot && member.user.bot) return false;
            const testMention: boolean = member.toString() === string;
            const testUsername: boolean = member.user.tag.toLowerCase().includes(string);
            const testDisplayName: boolean = member.displayName.toLowerCase().includes(string);
            return testMention || testUsername || testDisplayName;
        }) || null;
    }
    return null;
}

Util.localeToEmoji = function(countryCode: string): string {
    const firstLetter: string = String.fromCodePoint(countryCode.codePointAt(0) - 0x41 + 0x1F1E6);
    const secondLetter: string = String.fromCodePoint(countryCode.codePointAt(1) - 0x41 + 0x1F1E6);
    return `${firstLetter}${secondLetter}`
}

Util.getRandomUser = function(channel: TextChannel, bot: boolean = false): GuildMember {
    const members: Collection<string, GuildMember> = channel.members.filter((member: GuildMember) => { return bot || member.user.bot });
    return members.random();
}

Util.getRandomRole = function(guild: Guild): Role {
    return guild.roles.cache.random();
}

Util.propTotal = function <T>(objects: Array<T>, property: string): number {
    return objects.reduce((total: number, object: T) => total + object[property], 0);
}

Util.propAverage = function <T>(objects: Array<T>, property: string): number {
    return Util.propTotal<T>(objects, property) / (objects.length || 1);
}

Util.arrayFrequency = function(array: Array<any>): object {
    return array.reduce((frequencies: object, current: any) => {
        return ((frequencies[current] = ++frequencies[current] || 1), frequencies)
    }, {});
}

Util.arrayMode = function(array: Array<any>): object {
    return array.sort((a, b) => array.filter(v => v === a).length - array.filter(v => v === b).length).pop();
}

Util.capitalizeString = function(string: string): string {
    return string.toLowerCase().replace(/\_/g, ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}

Util.formatString = function(string: string, fill: Array<string>): string {
    return string.replace(/{(\d+)}/g, (match, number) => {
        return typeof fill[number] !== 'undefined' ? fill[number] : match;
    });
}

Util.formatDecimal = function(number: number, significance: number = 1): string {
    return (Number(number) || 0).toFixed(significance).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1');
}

Util.formatCommas = function(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

Util.formatDate = function(date: Date | string, options: FormatDateOptions = {}): string {
    date = date instanceof Date ? date : new Date(date);
    options = Object.assign({
        showTime: false,
        showDate: true,
        fullName: true
    }, options);

    const months = options.fullName ? ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateText = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    const timeText = `${date.getHours() % 12}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}${date.getHours() / 12 > 1 ? 'PM' : 'AM'}`;
    if (options.showDate && options.showTime) return `${dateText} at ${timeText}`;
    return options.showDate ? dateText : timeText;
}

export interface FormatDateOptions {
    showTime?: boolean; // Shows clock
    showDate?: boolean; // Shows date
    fullName?: boolean; // The full month name
}
