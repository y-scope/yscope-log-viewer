# Getting started

## Requirements

Node.js via [prebuilt installers][nodejs-prebuilt-installer] / [nvm][nvm] /
[nvm-windows][nvm-windows].

## Setup

Install the project's dependencies:

```shell
npm install
```

You may want to specify `--include=dev` if you are running in an environment where the environment
variable `NODE_ENV=production` is set.

## Running in development

You can build and serve the viewer in debug mode using:

```shell
npm run dev
```

The viewer should then be available at [http://localhost:3010](http://localhost:3010).

## Building a distribution

To create a build, run:

```shell
npm run build
```

The build should then be available in the `dist` directory.

## Previewing the Build

To preview the production build locally, run:

```shell
npm run preview
```

This will serve the contents of the `dist` directory using Vite’s preview server, which simulates
how the app will behave in production.

[nodejs-prebuilt-installer]: https://nodejs.org/en/download/prebuilt-installer
[nvm]: https://github.com/nvm-sh/nvm
[nvm-windows]: https://github.com/coreybutler/nvm-windows
