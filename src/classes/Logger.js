module.exports = class Logger {

    static log(name, args) {
        args = Array.isArray(args) ? args : [args];
        const nameString = `\x1b[33m${name}\x1b[0m`;
        const timeString = `\x1b[33m${new Date().toLocaleString()}\x1b[0m`;
        return console.log(`[${timeString}][${nameString}]`, ...args);
    }

    static error(name, args) {
        args = Array.isArray(args) ? args : [args];
        const nameString = `\x1b[33m${name}\x1b[0m`;
        const timeString = `\x1b[33m${new Date().toLocaleString()}\x1b[0m`;
        return console.error(`[${timeString}][${nameString}]`, ...args);
    }
}
