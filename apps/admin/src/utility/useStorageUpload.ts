import { useCallback } from "react"
import type { UploadProps } from "antd"
import { supabaseClient } from "./supabaseClient"

export interface UseStorageUploadOptions {
  /** Storage bucket to upload into. */
  bucket: string
  /**
   * Filename prefix (e.g. "photo" or "music"). The final stored name is
   * `${prefix}-${Date.now()}-${originalName}`.
   */
  prefix?: string
}

type CustomRequest = NonNullable<UploadProps["customRequest"]>

/**
 * Hook that returns an `Upload.customRequest` handler for Ant Design's
 * `<Upload.Dragger>` / `<Upload>` component. It uploads the file to the given
 * Supabase Storage bucket and invokes `onSuccess(publicUrl)` on success.
 *
 * Centralising this here removes the ~15 lines of copy-pasted Supabase upload
 * logic that previously lived in photos/create, photos/edit, and settings/edit.
 */
export function useStorageUpload({ bucket, prefix = "file" }: UseStorageUploadOptions) {
  return useCallback<CustomRequest>(
    (options) => {
      const { file, onSuccess, onError } = options
      // Ant Design types `file` as `string | RcFile | T`, but we only ever
      // receive a real `File` here in practice. Narrow with a runtime guard.
      if (!(file instanceof File)) {
        onError?.(new Error("Invalid file payload"))
        return
      }

      // Fire-and-forget the async work — Ant Design's customRequest returns void.
      void (async () => {
        try {
          const fileName = `${prefix}-${Date.now()}-${file.name}`
          const { error } = await supabaseClient.storage
            .from(bucket)
            .upload(fileName, file)

          if (error) throw error

          const { data: urlData } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(fileName)

          onSuccess?.(urlData.publicUrl)
        } catch (error) {
          onError?.(error as Error)
        }
      })()
    },
    [bucket, prefix],
  )
}
