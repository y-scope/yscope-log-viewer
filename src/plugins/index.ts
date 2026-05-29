import {s3ScannerPlugin} from "@yscope/log-viewer-plugin-s3-scanner";

import pluginRegistry from "../services/PluginRegistry";
import type {Plugin} from "../typings/plugin";


const PLUGINS: Plugin[] = [
    s3ScannerPlugin,
];

PLUGINS.forEach((plugin) => {
    pluginRegistry.register(plugin);
});
