# Optimization guide

This doc outlines strategies and tools used to optimize the build's size and load time.

## Bundle analysis

To generate a bundle analysis report, run:

```shell
# You may be prompted to install `vite-bundle-visualizer`. Accept the prompt to install it.
npm run analyze:size
```

This will use [`vite-bundle-visualizer`][vite-bundle-visualizer] to generate an interactive visual
breakdown of bundle contents, helping identify large dependencies and optimization opportunities.

## Future strategies

The following optimization strategies are planned for the future:

* **Code splitting**: We can split the code into smaller chunks to improve load time, especially
  when using lazy loading.
* **Lazy loading**: We can load components or modules only when they are needed. This can be
  achieved by using dynamic imports or React's `lazy()` and `Suspense` features.

[vite-bundle-visualizer]: https://www.npmjs.com/package/vite-bundle-visualizer
