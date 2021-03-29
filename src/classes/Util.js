module.exports = (Util) => class Newtil extends Util {

    static getRandomUser(channel, options = { bot: false }) {
        const members = [...channel.members.filter(member => options.bot || !member.user.bot).values()];
        return members[(members.length * Math.random()) << 0];
    }

    static getRandomRole(guild, options = {}) {
        const roles = [...guild.roles.cache.values()];
        return roles[(roles.length * Math.random()) << 0];
    }

    // Useful maths functions
    static total(objs, property) { return objs.reduce((total, obj) => total + obj[property], 0); }
    static average(objs, property) { return Newtil.total(objs, property) / (objs.length || 1); }
    static frequency(array) { return array.reduce((data, curr) => ((data[curr] = ++data[curr] || 1), data), {}); }
    static mode(array) { return array.sort((a, b) => array.filter(v => v === a).length - array.filter(v => v === b).length).pop(); }

    // Useful string functions
    static capitalize(text) { return text.toLowerCase().replace(/\_/g, ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' '); }
    static formatString(string, args) {
        return string.replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    }

    // Useful number functions
    static formatDecimal(number, places = 1) { return (Number(number) || 0).toFixed(places).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1'); }
    static formatCommas(string) { return string.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

    // Useful date formatting
    static formatDate(date, options) {
        date = date instanceof Date ? date : new Date(date);
        options = Object.assign({
            showTime: false, // Shows clock
            showDate: true, // Shows date
            fullName: true // The full month name
        }, options);

        const months = options.fullName ? ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateText = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        const timeText = `${date.getHours() % 12}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}${date.getHours() / 12 > 1 ? 'PM' : 'AM'}`;
        if (options.showDate && options.showTime) return `${dateText} at ${timeText}`;
        return options.showDate ? dateText : timeText;
    }
}
