# Setup Terraform

This action is used to install terraform of a specific version.

## Developing

I have noticed that VSCode plays nicer with it when you open VSCode in the `setup-terraform` folder instead of the root of the repository.

Make sure to run `npm run build` before commiting a change. The `.ts` files are not directly consumed. Instead it is transpiled along with its dependencies into a single `.js` file. The file is minified but is still big as it has all dependencies. This allows us to keep `node_modules` out of git.
