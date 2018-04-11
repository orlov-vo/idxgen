#! /usr/bin/env node
const indexGen = require('../src/index');

require('yargs')
  .command(
    '$0',
    'generate index files',
    () => {},
    (argv) => {
      const paths = argv._;

      if (!paths.length) {
        console.error('Please provide source dir!');
        return;
      }

      paths.forEach((path) => {
        indexGen.main(path);
      });

      if (argv.watch) {
        paths.forEach((path) => {
          indexGen.watch(path);
        });
      }
    },
  )
  .boolean('watch')
  .alias('w', 'watch').argv;
