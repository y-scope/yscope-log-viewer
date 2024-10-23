# Building

## Requirements
* Node.js via [prebuilt installers][nodejs-prebuilt-installer] / [nvm][nvm] / 
[nvm-windows][nvm-windows]

## Setup

Clone the repo to get a copy of the code for development

```shell
git clone https://github.com/yscope/yscope-log-viewer.git
cd yscope-log-viewer
```

## Install the dependencies

```shell
$ npm install
```

If you ever add a package manually to `package.json` or `package.json` changes
for some other reason, you should rerun this command.

## Running in development

```shell
$ npm start
```
The application should now be served in debug mode at http://localhost:3010. 

# Distribute

To create a build, run the following command and the build will be placed in the
`dist` folder:

```shell
$ npm run build
```

[nodejs-prebuilt-installer]: https://nodejs.org/en/download/prebuilt-installer
[nvm]: https://github.com/nvm-sh/nvm
[nvm-windows]: https://github.com/coreybutler/nvm-windows