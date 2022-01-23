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

const buildConfig = webpackConfig({
  env: 'production',
});

webpack({
  ...buildConfig,
  entry: {
    general: './services/general/index.js',
  },
}, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(colors.red(err.stack || err));

    if (err.details) {
      console.error(colors.red(err.details));
    }

    process.exit(1);
  }
});
//
// const startWatcher = () => {
//   const serverPaths = Object
//     .keys(compiler.options.entry)
//     .map(entry =>
//       path.join(compiler.options.output.path, `${entry}.js`)
//     );
//
//   serverPaths
//     .map(entry => {
//       return spawn('./node_modules/.bin/nodemon', [
//         '-q',
//         '--watch', entry,
//         '--watch', path.resolve('.env'),
//         '--exec', `node -e "require('${path.resolve(entry)}').default({});"`,
//       ], { stdio: 'inherit' });
//     });
// };
//
// compiler.watch(buildConfig.watchOptions, once(err => {
//   if (err) return;
//   startWatcher();
// }));
