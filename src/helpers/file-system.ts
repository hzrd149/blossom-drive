export function readFileSystemFile(fileEntry: FileSystemFileEntry) {
  return new Promise<File>((res, rej) => {
    fileEntry.file(
      (file) => res(file),
      (err) => rej(err),
    );
  });
}
export function readFileSystemDirectory(directory: FileSystemDirectoryEntry) {
  return new Promise<FileSystemEntry[]>((res, rej) => {
    directory.createReader().readEntries(
      (entries) => res(entries),
      (err) => rej(err),
    );
  });
}

export async function getAllFileEntriesInTree(item: FileSystemEntry): Promise<FileSystemFileEntry[]> {
  if (item.isFile) {
    return [item as FileSystemFileEntry];
  } else if (item.isDirectory) {
    const entries = await readFileSystemDirectory(item as FileSystemDirectoryEntry);
    return (await Promise.all(entries.map(getAllFileEntriesInTree))).flat();
  }
  return [];
}
