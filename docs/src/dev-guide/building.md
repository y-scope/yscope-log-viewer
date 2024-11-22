# Building

## Requirements

* Node.js via [prebuilt installers][nodejs-prebuilt-installer] / [nvm][nvm] /
  [nvm-windows][nvm-windows]

## Install the dependencies

```shell
$ npm install
```

You may want to specify option `--include=dev` if you are running in an environment where
environment variable `NODE_ENV=production` is set.

## Running in development

```shell
$ npm start
```

The application should now be served in debug mode at http://localhost:3010.

# Distribute

To create a build, run the following command and the build will be placed in the `dist` folder:

```shell
$ npm run build
```

[nodejs-prebuilt-installer]: https://nodejs.org/en/download/prebuilt-installer
[nvm]: https://github.com/nvm-sh/nvm
[nvm-windows]: https://github.com/coreybutler/nvm-windows
