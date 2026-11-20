export async function uploadPropertyImages(files: FileList | File[]): Promise<string[]> {
  const formData = new FormData();
  const list = Array.from(files).slice(0, 5);

  for (const file of list) {
    formData.append('images', file);
  }

  const response = await fetch('/api/uploads/property-images', {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json()) as { urls?: string[]; error?: string };
  if (!response.ok || !data.urls) {
    throw new Error(data.error || 'Failed to upload property images.');
  }

  return data.urls;
}
