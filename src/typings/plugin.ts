import {Nullable} from "./common";
import {FileSrcType} from "./worker";


/**
 * Interface for a plugin.
 */
interface Plugin {
    /** Unique identifier, e.g., "s3-scanner" */
    id: string;

    /** Human-readable name */
    name: string;

    /** Semver version */
    version: string;

    /** Optional: plugin-specific configuration schema */
    configSchema?: PluginConfigField[];

    /** Optional: contributes content to the File Info tab */
    fileInfoAugmentProvider?: FileInfoAugmentProvider;

    /** Optional: provides file listing from a storage backend */
    fileSourceProvider?: FileSourceProvider;

    /** Optional: contributes a sidebar panel */
    sidebarPanelProvider?: SidebarPanelProvider;
}

interface FileInfoAugmentProvider {
    /** Lazy-loaded component rendered at the bottom of the File Info tab. */
    component: React.LazyExoticComponent<React.ComponentType>;
}

interface FileSourceProvider {
    /**
     * Returns true if this provider can handle the given file source URL.
     * Called to determine which provider (if any) should list related files
     * for the currently loaded file. First-match wins among all registered
     * providers.
     */
    canHandle(fileSrc: string): boolean;

    /**
     * Lists files related to the given file source. The definition of
     * "related" is provider-specific (e.g., same S3 prefix, same naming
     * pattern).
     *
     * The provider fetches all related files eagerly (paginating through
     * the backend internally) and returns the complete list.
     *
     * @param fileSrc The URL of the currently loaded file.
     * @return The complete list of related files.
     */
    listRelatedFiles(fileSrc: string): Promise<RelatedFileList>;
}

interface RelatedFileList {
    files: RelatedFile[];
}

interface RelatedFile {
    /** Full path/key of the file. */
    path: string;

    /** Display name (typically the basename). */
    name: string;

    /** File size in bytes, if known. */
    size?: number;

    /** Last modified timestamp, if known. */
    lastModified?: Date;
}

interface SidebarPanelProvider {
    /** Unique panel ID, e.g., "s3-related-files" */
    id: string;

    /** Tab label displayed in the sidebar */
    label: string;

    /** Tab icon component */
    icon?: React.ComponentType<{className?: string}>;

    /**
     * The lazy-loaded panel component. Uses React.lazy to avoid
     * bloating the main bundle.
     */
    component: React.LazyExoticComponent<React.ComponentType>;

    /**
     * Determines whether the panel should be visible given the current
     * app state. If omitted, the panel is always visible.
     */
    shouldShow?: (context: PluginContext) => boolean;
}

interface PluginConfigField {
    /** Configuration key, scoped under the plugin ID. */
    key: string;

    label: string;

    type: "string" | "number" | "boolean" | "select";

    defaultValue: unknown;

    options?: {label: string; value: string}[];

    /** True to exclude from the settings UI (secret values). */
    secret?: boolean;
}

interface PluginContext {
    /** Read current file source (URL or File object). */
    getFileSrc(): Nullable<FileSrcType>;

    /** Read current file name. */
    getFileName(): string;

    /** Read current log event number. */
    getLogEventNum(): number;

    /** Navigate to a different file by URL. Opens in current tab. */
    navigateTo(filePath: string, logEventNum?: number): void;

    /** Navigate to a different file by URL. Opens in a new tab. */
    openInNewTab(filePath: string, logEventNum?: number): void;

    /** Post a notification to the snackbar. */
    notify(message: string, level?: "info" | "warn" | "error"): void;

    /** Read a plugin-specific config value. */
    getConfig(pluginId: string, key: string): string | null;

    /** Write a plugin-specific config value. */
    setConfig(pluginId: string, key: string, value: string): void;
}

export type {
    FileInfoAugmentProvider,
    FileSourceProvider,
    Plugin,
    PluginConfigField,
    PluginContext,
    RelatedFile,
    RelatedFileList,
    SidebarPanelProvider,
};
