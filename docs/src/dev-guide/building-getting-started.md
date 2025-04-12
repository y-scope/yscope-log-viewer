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
npm start
```

The viewer should then be available at [http://localhost:3010](http://localhost:3010).

## Building a distribution

To create a build, run:

```shell
npm run build
```

The build should then be available in the `dist` directory.

## Deploying the distribution

To deploy the application, serve the contents of the `dist` directory using a static file host.

### Static File Hosting

You can deploy the dist/ folder to any static hosting service such as:

* **[GitHub Pages][github-pages]** \
  Forking this repository will automatically deploy the site to 
  `https://<your-github-username>.github.io/yscope-log-viewer/` using GitHub Pages.
  [An automatic deployment workflow][gh-workflow-deploy-gh-pages] deploys the application to 
  GitHub Pages on every push to the main branch. Make sure to 
  [enable GitHub Actions][enable-gh-actions] for your fork to activate the workflow.
* **Netlify**, **Vercel**, or **Cloudflare Pages**
* Traditional servers using **Nginx** or **Apache**
* Object storage + CDN setups (e.g. **AWS S3** + **CloudFront**)

Ensure your server or platform serves static assets with appropriate MIME types as outlined below.

### MIME Types

The server should be configured to serve WebAssembly (`.wasm`) files with MIME type
`application/wasm`.

:::{warning}
Failing to do so can cause the Emscripten-generated JavaScript wrapper to make 
two HTTP requests for the same `.wasm` file, leading to unnecessary network overhead. This issue is 
detailed in [Emscripten issue #18468](https://github.com/emscripten-core/emscripten/issues/18468).

Modern web servers have incorporated this MIME type by default:

* **Nginx** includes the correct MIME type starting from 1.21.0.
* **Apache HTTP Server** relies on the system's `/etc/mime.types` file; Debian-based systems include
  the correct type in the media-types package version 3.62, which is available in Debian Buster /
  Ubuntu 20.04 LTS and later.

If your server does not have this MIME type configured, you will need to manually add it.
:::

### Compression

Enable **Gzip**, **Brotli**, or **Zstandard** compression for `.js`, `.css`, `.wasm`, and `.html` 
files to reduce transfer sizes and improve load times. Most modern browsers have at least one of 
these algorithms enabled by default.

You can verify that compression is working by inspecting the response headers of the static assets -
the `Content-Encoding` header should show `gzip`, `br`, or `zstd` depending on what was applied. See 
[MDN: Content-Encoding][mdn-content-encoding] for more details.

### HTTPS / TLS

It is highly recommended to serve the application over HTTPS, especially if you use the `filePath`
URL search parameter to load external log files. Modern browsers enforce [mixed content 
restrictions][mdn-mixed-context-restrictions], which blocks loading files from insecure (`http://`) 
sources when the application itself is served over HTTPS. This is due to browser security policies,
not a limitation of the application itself.

For the same reason, if you need to load files from insecure sources, you can either:
* Serve the application over HTTP.
* Use a local server to serve the application over HTTPS and load files from insecure sources.

Serving over HTTP is generally discouraged in production environments for security reasons.
Whenever possible, host both the application and any log files on secure origins.

[emscripten-issue-18468]: https://github.com/emscripten-core/emscripten/issues/18468
[enable-gh-actions]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
[github-pages]: https://pages.github.com/
[gh-workflow-deploy-gh-pages]: https://github.com/y-scope/yscope-log-viewer/blob/main/.github/workflows/deploy-gh-pages.yaml
[mdn-content-encoding]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding
[mdn-mixed-context-restrictions]: https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content
[nodejs-prebuilt-installer]: https://nodejs.org/en/download/prebuilt-installer
[nvm]: https://github.com/nvm-sh/nvm
[nvm-windows]: https://github.com/coreybutler/nvm-windows
