# `<MonacoInstance/>`

## Overview

The `<MonacoInstance/>` component is a standalone React component designed to provide an embedded 
Monaco Editor instance for log viewing.

## Setup

Before using `<MonacoInstance/>`, ensure that the Monaco environment is properly registered. This 
must be done at the entry point of your React application.

### Registering the Monaco Environment

To bootstrap the Monaco environment, import the required setup file in your app's entry file (e.g.,
`main.tsx`):

```tsx
// Ensure this path points to the correct bootstrap file
import "path/to/bootstrap";
```

This step ensures that the necessary configurations and workers are properly loaded before using 
MonacoInstance.

## Usage

Once the Monaco environment is registered, you can use the MonacoInstance component anywhere within
your application:

```ts
import MonacoInstance from "path/to/MonacoInstance";

const MyEditor = () => {
  return <MonacoInstance { ...props } />;
}

export default MyEditor;
```
