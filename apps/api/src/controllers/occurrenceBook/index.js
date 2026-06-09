const { getNextEntry, createEntry } = require('./entryController');
const { getMyEntries, getAllEntries, getSecurityGuards } = require('./queryController');
const { signOff } = require('./signOffController');

module.exports = { getNextEntry, createEntry, getMyEntries, getAllEntries, getSecurityGuards, signOff };
