const path = require('path');
const fs = require('mz/fs');

const config = require('./config');

const DISABLE_KEYWORD = 'idxgen-disable';
const TEMPLATE_KEYWORD = 'idxgen-template';

async function readComponents(searchDirectory) {
  const initialState = { directories: [], files: [] };

  try {
    const components = await fs.readdir(searchDirectory);

    return components.reduce(async (pacc, component) => {
      const acc = await pacc;
      const componentPath = path.resolve(searchDirectory, component);
      const componentStat = await fs.stat(componentPath);

      return componentStat.isDirectory()
        ? { ...acc, directories: [...acc.directories, componentPath] }
        : { ...acc, files: [...acc.files, component] };
    }, initialState);
  } catch (err) {
    return initialState;
  }
}

function getGlobalTemplate() {
  if (config.template) {
    return config.template;
  }

  if (config.exportMode.toLowerCase() === 'single') {
    return "export { $$ } from './$$';";
  }

  return "export { default as $$ } from './$$';";
}

async function generateIndex(directoryPath, files) {
  const indexPath = path.resolve(directoryPath, 'index.js');

  const data = await (async () => {
    try {
      return await fs.readFile(indexPath, 'utf8');
    } catch (err) {
      return '';
    }
  })();

  if (data.indexOf(DISABLE_KEYWORD) !== -1) {
    return;
  }

  const templateIndex = data.indexOf(TEMPLATE_KEYWORD);
  const template =
    templateIndex !== -1
      ? data
          .substring(templateIndex + TEMPLATE_KEYWORD.length, data.indexOf('\n', templateIndex))
          .trim()
      : getGlobalTemplate();

  const searchJsFiles = files
    .map((fileName) => fileName.match(/^(.*)\.([^/.]+)$/))
    .map((matchFileName) => ({ name: matchFileName[1], extension: matchFileName[2] }))
    .filter((file) => ['js', 'jsx'].indexOf(file.extension) !== -1)
    .map((file) => file.name)
    .filter(
      (fileName) =>
        fileName.toLowerCase() !== 'index' && !/\.(spec|test|story)$/.test(fileName.toLowerCase()),
    );

  if (searchJsFiles.length === 0) {
    return;
  }

  const fd = await fs.open(indexPath, 'w');

  const beginString = '/* Auto-generated - start - do not modify in this block */';
  const endString = '/* Auto-generated - end */';

  const beginPosition = data.indexOf(beginString);
  const endPosition = data.indexOf(endString);

  if (config.support.flow && data.indexOf('@flow') === -1) {
    fs.writeSync(fd, '// @flow\n');
  }

  if (beginPosition !== -1 && endPosition !== -1) {
    fs.writeSync(fd, data.slice(0, beginPosition));
  } else if (data.length > 0) {
    fs.writeSync(fd, `${data}\n`);
  }

  fs.writeSync(fd, `${beginString}\n`);

  if (config.support.eslint && searchJsFiles.length === 1) {
    fs.writeSync(fd, '/* eslint-disable import/prefer-default-export */\n');
  }

  searchJsFiles.map((fileName) => template.replace(/\$\$/g, fileName)).forEach((string) => {
    if (config.support.prettier && string.length > config.prettier.printWidth) {
      fs.writeSync(fd, '// prettier-ignore\n');
    }
    fs.writeSync(fd, `${string}\n`);
  });

  if (beginPosition !== -1 && endPosition !== -1) {
    fs.writeSync(fd, data.slice(endPosition));
  } else {
    fs.writeSync(fd, `${endString}\n`);
  }
}

async function searchAndGenerateIndex(searchDir) {
  const dirname = path.basename(searchDir);

  if (/^(__|\.)/.test(dirname)) {
    return;
  }

  const { files, directories } = await readComponents(searchDir);

  if (files.length) {
    await generateIndex(searchDir, files);
  }

  directories.forEach((dir) => searchAndGenerateIndex(dir));
}

async function main(srcPath) {
  const srcDir = path.resolve(srcPath);

  searchAndGenerateIndex(srcPath);
}

function watch(srcPath) {
  const srcDir = path.resolve(srcPath);

  fs.watch(srcDir, { recursive: true }, (eventType, file) => {
    if (eventType === 'rename') {
      const filename = path.basename(file);

      const match = filename.match(/^(.*)\.([^/.]+)$/);
      const name = match[1].toLowerCase();
      const extension = match[2].toLowerCase();

      if (
        !['js', 'jsx'].includes(extension) ||
        name === 'index' ||
        /\.(spec|test|story)$/.test(name)
      ) {
        return;
      }

      main(srcDir);
    }
  });
}

exports.main = main;
exports.watch = watch;
