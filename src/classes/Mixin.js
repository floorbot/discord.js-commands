const Handler = require('./Handler')

/**
 * module - This module will take any 'mixin' class and chain them to the handler class
 *
 * @return {Class} The resulting class with all mixins mixed in
 */
module.exports = function() {
    const superclasses = [...arguments];
    const superclass = superclasses.pop();
    if (superclasses.length) return superclass(Mixin(...superclasses));
    return superclass(Handler);
}
