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

For enable support-modes you can create `.idxgenrc` with this content. Important if `template`
variable is used (or `idxgen-template` in index file) `exportMode` will not been applied.

```
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

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
