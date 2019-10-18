# GitHub Release Download

This action is used to download an artifact from a GitHub repository release.

## release_format parameters

- `$OS` - is one of `windows`, `linux`, or `darwin`
- `$ARCH` - is one of `amd64` or `386`
- `$TOOL` - is the argument passed into this action
- `$VERSION` - the tag version used (`latest` will get resolved to the latest tag name)
- `$SVERSION` - `$VERSION` but with `v` removed from the beginning

> the `release_format` will get suffixed with either `.zip` or `.tar.gz` depending on the operating system.

## Developing

I have noticed that VSCode plays nicer with it when you open VSCode in the `github-release-download` folder instead of the root of the repository.

Make sure to run `npm run build` before commiting a change. The `.ts` files are not directly consumed. Instead it is transpiled along with its dependencies into a single `.js` file. The file is minified but is still big as it has all dependencies. This allows us to keep `node_modules` out of git.
