[![npm](https://img.shields.io/npm/v/idxgen.svg?style=flat-square)](https://www.npmjs.com/package/idxgen)
[![npm](https://img.shields.io/npm/dt/idxgen.svg?style=flat-square)](https://www.npmjs.com/package/idxgen)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![GitHub license](https://img.shields.io/github/license/orlov-vo/idxgen.svg?style=flat-square)](https://github.com/orlov-vo/idxgen/blob/master/LICENSE)

# idxgen

Simple generator of index files for ES-modules. It well working with TypeScript, Flow, ESlint,
Prettier.

## Example of using

If you have this structure in project:

```
src/
├── C.js
└── foo
    ├── A.js
    └── B.js
```

After run `npx idxgen src`, you will have this structure:

```
src/
├── C.js
├── foo
│   ├── A.js
│   ├── B.js
│   └── index.js
└── index.js
```

Where `src/index.js`:

```
/* Auto-generated - start - do not modify in this block */
export { default as C } from './C';
/* Auto-generated - end */
```

And `src/foo/index.js`:

```
/* Auto-generated - start - do not modify in this block */
export { default as A } from './A';
export { default as B } from './B';
/* Auto-generated - end */
```

## Getting Started

### Installing

```
npm install --save-dev idxgen
```

### Using

Generate `index.js` files in `src` folder. It travels recursively.

```
npx idxgen src/
```

Run in watch mode:

```
npx idxgen --watch src/
```

For disabling generation you can put this annotation:

```
// idxgen-disable
```

### Configuration

For configure this tool you can create `.idxgenrc`:

```json
{
  "mode": "manual",
  "exportMode": "single",
  "template": "export { $$ } from './$$';",
  "indexFile": "index.ts",
  "extensions": ["ts", "tsx"],
  "support": {
    "flow": true,
    "eslint": true,
    "prettier": true
  }
}
```

##### `mode: "manual" | "auto"`

In `manual` mode it will generate exports in index files if it contain `// idxgen-enable` pragma.
In `auto` mode it will generate exports in all index files if it isn't contain `// idxgen-disable`
pragma. Default value `auto`.

##### `exportMode: "single" | "default"`

In `single` export mode it will use `export { $$ } from './$$';` template instead
`export { default as $$ } from './$$';` in `default` mode. Important if `template` variable is used
(or `idxgen-template` pragma in index file) `exportMode` will not been applied.

##### `template: string`

With this You can override export statement in index files. Or you can override in only one file
with `// idxgen-template` pragma.

##### `indexFiles: string`

Filename of index files. Default value: `index.js`.

##### `extensions: string[]`

Extensions of file for lookup in folders. Default value: `[".js", "jsx"]`.

##### `support: object`

This object contain support-flags for integration with 3-rd part tools.

###### `flow: boolean`

If this support is enabled it will insert `// @flow` at the top of index file.

###### `eslint: boolean`

If this support is enabled it will insert `/* eslint-disable import/prefer-default-export */` if
you have one export in a index file.

###### `prettier: boolean`

If this support is enabled it will insert `// prettier-ignore` if line will be more than
`printWidth` in prettier config.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
