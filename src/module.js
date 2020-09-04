'use strict'
/* eslint-env node, es6 */

const {
  readFile,
} = require('fs')

const {
  promisify,
} = require('util')

const svgo = require('svgo')

const readFileAsync = promisify(readFile)

const svgMinifier = new svgo({
  full: true,
  plugins: [
    {
      cleanupAttrs: {
        newlines: true,
        trim: true,
        spaces: true,
      },
    },
    {
      removeXMLNS: true,
    },
    {
      removeDimensions: true,
    },
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
  ],
})

const TAG_NAME = 'inlineSVG'

/**
 * @param {Map} fileMap List of files with their content
 * @param {object} opt Module options
 * @param {Array<String>} assets List of directories that include the images
 * @param {boolean} [opt.minify=false] Whether the content should be minified
 * @param {object} lib Engine library
 * @param {function} lib.log
 * @param {function} lib.findAsset
 * @param {function} lib.getTag
 * @param {function} lib.getTagList
 */
module.exports = async(fileMap, opt, lib) => {
  const assets = opt.assets
  const minify = opt.minify === true
  const { findAsset, getTag, getTagList, log } = lib

  if (assets == null) {
    log('No assets provided.')
    return
  }

  // Read file tags
  const depsPerFile = new Map()

  for (const [path, content] of fileMap.entries()) {
    const depList = getTagList(TAG_NAME, content)

    depsPerFile.set(path, depList)
  }

  // Initialize a unique list of dependencies
  const depMap = new Map()

  for (const depList of depsPerFile.values()) {
    for (const depPath of depList) {
      if (depMap.has(depPath) === false) {
        depMap.set(depPath, null)
      }
    }
  }

  // Fetch dependencies content
  await Promise.all(Array.from(depMap.keys())
    .map(async name => {
      const path = await findAsset(name, assets)

      if (path == null) {
        throw `Dependency not found: ${path}`
      }

      const content = await readFileAsync(path, { encoding: 'utf8' })
        .then(content => {
          if (minify) {
            return svgMinifier.optimize(content)
              .then(result => result.data)
          }

          return content
        })

      depMap.set(name, content)
    }))

  // Replace assets
  for (const [path, tagList] of depsPerFile.entries()) {
    if (tagList.length > 0) {
      let content = fileMap.get(path)

      for (const tag of tagList) {
        const tagName = getTag(TAG_NAME, tag)
        const depValue = depMap.get(tag)

        content = content.replace(new RegExp(tagName, 'g'), depValue)

        log(`InlineSVG: ${tag} in ${path}`)
      }

      fileMap.set(path, content)
    }
  }
}
