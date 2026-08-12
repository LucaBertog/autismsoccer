export function getImageFilesFromClipboard(clipboard: DataTransfer | null | undefined): File[] {
  if (!clipboard) return []

  const images: File[] = []

  if (clipboard.files?.length) {
    for (const file of clipboard.files) {
      if (file.type.startsWith('image/')) images.push(file)
    }
  }

  if (images.length === 0 && clipboard.items?.length) {
    for (const item of clipboard.items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) images.push(file)
      }
    }
  }

  return images
}
