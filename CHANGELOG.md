# Version 1.3.2 August 21th, 2020

- Adds the `showIntro` option for each tree
- More documentation and the `test-dev` npm script

# Version 1.3.1 August 17th, 2020

- Uses a custom slugify method
- Fixes bugs on the translator

# Version 1.3.0 August 15th, 2020

- Added support for Markdown (in the node's body only) and text only (uses the new `bodyFormat` tree option)
- Renamed `--build-mode` to `--builder-mode`
- Added the `--watch-tree` option to watch file changes in the tree definitions
- Added the `--use-stable-ids` option to generate option id in a predictable way (useful while developing trees)
- Tree validation always performs schema validation, also when in `builder mode`
- Added json-schema validation to the settings file
- Added all the strings in the settings to provide a poor man "i18n"
  Breaking change: the settings `custom` key has been renamed to `string`
- Added the `t` helper for string transposition

# Version 1.2.0 August 10th, 2020

- Moved to YAML for the tree definition

# Version 1.1.0 August 8th, 2020

- Use onSelect and deprecates nextNodeId

# Version 1.0.0 August 1st, 2020

First public release
