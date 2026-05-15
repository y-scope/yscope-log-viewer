import type {
    FileInfoAugmentProvider,
    FileSourceProvider,
    Plugin,
    SidebarPanelProvider,
} from "../../typings/plugin";


const UNDEFINED_PROVIDER = "undefined";

class PluginRegistry {
    private plugins: Map<string, Plugin> = new Map();

    register (plugin: Plugin): void {
        if (this.plugins.has(plugin.id)) {
            console.warn(`Plugin "${plugin.id}" is already registered; skipping duplicate.`);

            return;
        }
        this.plugins.set(plugin.id, plugin);
    }

    getFileSourceProviders (): FileSourceProvider[] {
        return [...this.plugins.values()]
            .filter((p) => typeof p.fileSourceProvider !== UNDEFINED_PROVIDER)
            .map((p) => p.fileSourceProvider as FileSourceProvider);
    }

    getSidebarPanelProviders (): SidebarPanelProvider[] {
        return [...this.plugins.values()]
            .filter((p) => typeof p.sidebarPanelProvider !== UNDEFINED_PROVIDER)
            .map((p) => p.sidebarPanelProvider as SidebarPanelProvider);
    }

    getFileInfoAugmentProviders (): FileInfoAugmentProvider[] {
        return [...this.plugins.values()]
            .filter((p) => typeof p.fileInfoAugmentProvider !== UNDEFINED_PROVIDER)
            .map((p) => p.fileInfoAugmentProvider as FileInfoAugmentProvider);
    }

    getPlugin (id: string): Plugin | null {
        return this.plugins.get(id) ?? null;
    }

    getAllPlugins (): Plugin[] {
        return [...this.plugins.values()];
    }
}

const pluginRegistry = new PluginRegistry();
export default pluginRegistry;
