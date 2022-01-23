const path = require('path');

const { argv } = require('yargs');
const colors = require('colors/safe');

if (!argv._.length) {
  console.error(colors.red(
    '[poool.run] No service specified, nothing to run.'
  ));
  process.exit(1);
}

const server = require(path.resolve(`./build/${argv._[0]}.js`)).default;

server({ port: process.env.PORT || 8000 });
