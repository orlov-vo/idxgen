const cosmiconfig = require('cosmiconfig');
const _get = require('lodash.get');

const mainCfg = cosmiconfig('idxgen', { sync: true });
const prettierCfg = cosmiconfig('prettier', { sync: true });

const { config = {} } = mainCfg.load() || {};

const result = {
  mode: _get(config, 'mode', 'auto'),
  exportMode: _get(config, 'exportMode'),
  indexFile: _get(config, 'indexFile', 'index.js'),
  extensions: _get(config, 'extensions', ['js', 'jsx']),
  template: _get(config, 'template'),
  support: {
    flow: _get(config, ['support', 'flow'], false),
    eslint: _get(config, ['support', 'eslint'], false),
    prettier: _get(config, ['support', 'prettier'], false),
  },
};

if (result.support.prettier) {
  const { config: prettier = {} } = prettierCfg.load() || {};

  result.prettier = {
    printWidth: _get(prettier, 'printWidth', 80),
  };
}

module.exports = result;
