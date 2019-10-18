# Set Environment Variables

This action is used to set Environment Variables for the whole job.

```yaml
- name: Set Environment
  uses: ./set-environment-variables
  env:
    RANDOM_ENV: foo
    ANOTHER_VAR: bar
  with:
    variables: RANDOM_ENV,ANOTHER_VAR
```

## Developing

I have noticed that VSCode plays nicer with it when you open VSCode in the `set-environment-variables` folder instead of the root of the repository.

Make sure to run `npm run build` before commiting a change. The `.ts` files are not directly consumed. Instead it is transpiled along with its dependencies into a single `.js` file. The file is minified but is still big as it has all dependencies. This allows us to keep `node_modules` out of git.
