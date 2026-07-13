import { put, list, del } from "@vercel/blob";

function encodeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9/_-]/g, "_");
}

export function hasBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function blobPutJson<T>(pathname: string, data: T): Promise<void> {
  if (!hasBlobStore()) throw new Error("Blob store not configured");
  await put(encodeKey(pathname), JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export async function blobGetJson<T>(pathname: string): Promise<T | null> {
  if (!hasBlobStore()) return null;
  try {
    const encoded = encodeKey(pathname);
    const { blobs } = await list({
      prefix: encoded,
      limit: 1,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const match = blobs.find((b) => b.pathname === encoded) ?? blobs[0];
    if (!match?.url) return null;
    const res = await fetch(match.url, {
      headers: process.env.BLOB_READ_WRITE_TOKEN
        ? { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
        : undefined,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function blobDelete(pathname: string): Promise<void> {
  if (!hasBlobStore()) return;
  try {
    await del(encodeKey(pathname), { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {
    // ignore
  }
}
