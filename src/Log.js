const logSymbols = require('log-symbols');
const dateFormat = require('date-format');

module.exports = class{
    static send(symbol, message)
    {
        console.log(`[${dateFormat('yyyy-MM-dd, hh:mm:ss')}] ${logSymbols[symbol]} ${message}`);
    }
}
