## Web Builder Module - Inline SVG files

This module allows the [@deskeen/web-builder](https://github.com/deskeen/web-builder) engine to inline SVG files.

It uses the [svgo](https://github.com/svg/svgo) package under the hood to minify the files.


## Install

```
npm install @deskeen/web-builder
npm install @deskeen/web-builder-inline-svg
```


### Usage

And add the module to the list of modules: 

```javascript
const builder = require('@deskeen/web-builder')
const builder.build([
  source: [
    // List of files or directories that include inlineSVG tags
    // {{inlineSVG:file.svg}}
  ],
  modules: [
    [
      '@deskeen/web-builder-inline-svg',
      {
        assets: [
          // List of directories that include the images
        ],
        minify: true, // Optional
      }
    ]
  ]
])
```


## Contact

You can reach me at {my_firstname}@{my_name}.fr


## Licence

MIT Licence - Copyright (c) Morgan Schmiedt