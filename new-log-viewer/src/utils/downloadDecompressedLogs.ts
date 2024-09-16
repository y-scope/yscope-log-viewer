interface downloadDecompressedLogsProps {
    blob: Blob,
    fileName: string,
}

/**
 *
 * @param blob.blob
 * @param blob
 * @param fileName
 * @param blob.fileName
 */
const downloadDecompressedLogs = ({blob, fileName}: downloadDecompressedLogsProps) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}-exported-${new Date().toISOString()
        .replace(/[:.]/g, "-")}.log`;
    link.click();
    URL.revokeObjectURL(url);
};

export default downloadDecompressedLogs;
