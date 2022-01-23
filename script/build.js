const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const { argv } = require('yargs');
const colors = require('colors/safe');
const webpack = require('webpack');
const { once } = require('ramda');

const webpackConfig = require('../webpack.config.js');
const listServices = require('./list-services');

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
