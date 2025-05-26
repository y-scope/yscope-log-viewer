# Deploying a distribution

To deploy a [built](building-getting-started.md) distribution of the log viewer, you'll need to do
the following:

1. [Serve the files using a static file host](#static-file-hosting).
2. Apply any of the following optimizations:
   * [Compression](#enabling-compression)
   * [Configure a MIME type for WebAssembly files](#configuring-a-webassembly-mime-type)

## Static file hosting

You can deploy the built distribution (the `dist` directory) to any static hosting service such as:

* [GitHub Pages][github-pages]

  :::{tip}
  If you fork this repository and [enable GitHub Actions][enable-gh-actions] in your fork, every
  push will trigger the [deployment workflow][gh-workflow-deploy-gh-pages] to deploy the site to
  `https://<your-github-username>.github.io/yscope-log-viewer/` using GitHub Pages.
  :::

* [Netlify]
* [Cloudflare Pages][cloudflare-pages]
* [Vercel]
* Object storage with a CDN (e.g., [AWS S3 with CloudFront][cloudfront-hosting])

Alternatively, you can set up your own web server (e.g., [Apache HTTP Server][apache-httpd] or
[Nginx]).

:::{tip}
We recommend serving the distribution (and by extension, any log files the user wishes to view) over
a secure connection.
:::

If you encounter any issues with serving the distribution with a static file host, check out the
[troubleshooting](#troubleshooting) section below for potential solutions.

### Troubleshooting

1. If users of the deployed distribution want to load log files from a different origin than the
   static file host, you'll need to ensure that the host serving the log files supports
   [cross-origin resource sharing (CORS)][mdn-cors].

   :::{note}
   Sites served over `http://` and `https://` are considered different origins, even if the domain
   is the same.
   :::

2. If your static file host serves the log viewer over a secure connection, modern browsers won't
   allow users to load log files over an insecure connection due to
   [mixed content restrictions][mdn-mixed-content-restrictions].

## Enabling compression

To improve load times, you can reduce file transfer sizes by enabling compression for the files in
the distribution (`.css`, `.js`, `.html`, and `.wasm` files). You can enable compression by
configuring the static file host to support popular [content-encoding][mdn-content-encoding] methods
(e.g., `gzip`).

You can verify that compression is working by inspecting the response headers for any of the static
assets. The `Content-Encoding` header should show a supported content encoding method (e.g., `br`,
`gzip`, or `zstd`).

## Configuring a WebAssembly MIME type

To avoid unnecessary downloads of WebAssembly (`.wasm`) files (see
[emscripten-core/emscripten#18468]), the server should be configured to serve such files using the
`application/wasm` MIME type. The following web server deployments use this MIME type by default:

* The [Apache HTTP Server][apache-httpd] on Debian-based systems (e.g., Debian v10+ or Ubuntu
  v20.04+)
  * This deployment relies on the system's `/etc/mime.types` file which is included in the
    media-types v3.62 package).
* [Nginx] v1.21.0+.

If your web server is not one of the above, ensure it is configured to use the aforementioned MIME
type.

[apache-httpd]: https://httpd.apache.org/
[cloudflare-pages]: https://pages.cloudflare.com/
[cloudfront-hosting]: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/getting-started-cloudfront-overview.html
[emscripten-core/emscripten#18468]: https://github.com/emscripten-core/emscripten/issues/18468
[enable-gh-actions]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
[gh-workflow-deploy-gh-pages]: https://github.com/y-scope/yscope-log-viewer/blob/main/.github/workflows/release.yaml
[github-pages]: https://pages.github.com/
[mdn-content-encoding]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding
[mdn-cors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
[mdn-mixed-content-restrictions]: https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content
[Netlify]: https://www.netlify.com/
[Nginx]: https://nginx.org/
[Vercel]: https://vercel.com/
