exports.logger = function(ns, options) {
    return console.log.bind(console,
            ns + ':' + (options.timestamp? (' [' + new Date().toString().match(/\w+ (\w+ \w+) \w+ (........)/).slice(1).join(', ') + ']') : ''));
};
