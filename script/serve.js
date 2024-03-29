const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const { argv } = require('yargs');
const colors = require('colors/safe');
const webpack = require('webpack');
const { once } = require('ramda');

const webpackConfig = require('../webpack.config.js');
const listServices = require('./list-services');

if (!fs.existsSync(path.resolve('.env'))) {
  console.error(colors.red(
    '[blinddeez.serve] No .env file found, please run `yarn getenv @dev` ' +
    'to be able to serve.',
  ));
  process.exit(1);
}

const envFile = fs.readFileSync(path.resolve('.env'), { encoding: 'utf8' });

if (envFile.indexOf('# DEV') === -1 && !argv.force) {
  console.error(colors.red(
    '[blinddeez.serve] Your .env file doesn\'t seem to be meant for ' +
    ' development environment. Please run `yarn getenv @dev` and try again, ' +
    'or re-run this command with `yarn serve --force yourService`.',
  ));
  process.exit(1);
}

if (!argv._.length) {
  console.log(colors.cyan(
    '[blinddeez.serve] No service specified, serving all services.'
  ));
  argv._ = [...listServices()];
}

process.on('SIGINT', process.exit);

const buildConfig = webpackConfig({
  env: 'development',
});

const compiler = webpack({
  ...buildConfig,
  entry: {
    general: './services/general/index.js',
  },
});

const startWatcher = () => {
  const serverPaths = Object
    .keys(compiler.options.entry)
    .map(entry =>
      path.join(compiler.options.output.path, `${entry}.js`)
    );

  serverPaths
    .map(entry => {
      return spawn('./node_modules/.bin/nodemon', [
        '-q',
        '--watch', entry,
        '--watch', path.resolve('.env'),
        '--exec', `node -e "require('${path.resolve(entry)}').default({});"`,
      ], { stdio: 'inherit' });
    });
};

compiler.watch(buildConfig.watchOptions, once(err => {
  if (err) return;
  startWatcher();
}));
