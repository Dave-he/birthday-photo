/**
 * Supabase Storage buckets used by the admin panel.
 *
 * `photos` and `music` are separate buckets on purpose: a bucket carries a
 * MIME-type whitelist, and an MP3 in the image bucket is rejected by storage.
 * The buckets (and their policies) are created by `database/storage.sql`.
 */
export const STORAGE_BUCKETS = {
  photos: "photos",
  music: "music",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
