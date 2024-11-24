# Overview

The log viewer is written using the ReactJS framework and uses the open source [monaco-editor] and
[clp-ffi-js].

The viewer spawns a worker to assist with computationally intensive tasks such as:

* Deserializing the file and creating an index of logs events.
* Paginating the indexed logs.
* Decoding the deserialized log events into plain text.

Tasks are passed to the worker as needed and changes are rendered in the UI.

[clp-ffi-js]: https://github.com/y-scope/clp-ffi-js
[monaco-editor]: https://microsoft.github.io/monaco-editor/
