# Bundle size and load time optimization

This document outlines strategies and tools used to optimize the size and load time.

## Bundle analysis

We use [`vite-bundle-visualizer`][vite-bundle-visualizer] to analyze the output bundle. To generate
a bundle analysis report, run:

```shell
npm run analyze:size
```

This will generate an interactive visual breakdown of bundle contents, helping identify large
dependencies and optimization opportunities.

## Future strategies
The following strategies are planned for future optimization:
* **Code splitting**: We can split the code into smaller chunks to improve load time. This can be
  achieved by using dynamic imports for large modules or components that are not needed immediately.
* **Lazy loading**: We can load components or modules only when they are needed. This can be
  achieved by using dynamic imports or React's `lazy()` and `Suspense` features.

[vite-bundle-visualizer]: https://www.npmjs.com/package/vite-bundle-visualizer

