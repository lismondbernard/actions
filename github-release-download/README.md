# GitHub Release Download

This action is used to download an artifact from a GitHub repository release.

It is expecting a few things in order to be used appropriately.

1. The format of the artifact needs to be `$tool-$os-$arch.$comp`
   - `$tool` is the argument passed into this action
   - `$os` is one of `windows`, `linux`, or `darwin`
   - `$arch` is one of `amd64` or `386`
   - `$comp` is `tar.gz` for `linux` and `darwin` OSs and `zip` for `windows`
2. To add something to the PATH, the archive needs to have a `bin/` directory with everything you want on the PATH in it.

## Developing

I have noticed that VSCode plays nicer with it when you open VSCode in the `github-release-download` folder instead of the root of the repository.

Make sure to run `npm run build` before commiting a change. The `.ts` files are not directly consumed. Instead it is transpiled along with its dependencies into a single `.js` file. The file is minified but is still big as it has all dependencies. This allows us to keep `node_modules` out of git.
