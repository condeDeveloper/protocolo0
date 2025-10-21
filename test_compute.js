const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('script.js', 'utf8');
const sandbox = { console, module: {}, require };
vm.createContext(sandbox);
vm.runInContext(code + '\nmodule.exports = { computeReply };', sandbox);
const { computeReply } = sandbox.module.exports;

const tests = [
  'quem é você?',
  'Quem é você',
  'quem e voce',
  'QUEM É VOCÊ!!!',
  'oi',
  'bom dia'
];

tests.forEach(t => {
  console.log('INPUT:', t, '\nREPLY:', computeReply(t), '\n---');
});
