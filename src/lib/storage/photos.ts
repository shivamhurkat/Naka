/* eslint-disable @typescript-eslint/no-explicit-any */
// deleted_at on photos table is added by migration 0007 — not yet in the generated DB types,
// so we use `as any` casts until the next `db:types` run.

import { createAdminClient } from "@/lib/supabase/admin";
import type { Session } from "@/lib/auth/session";

export type PhotoEntityType = "inbound_lot" | "outbound_dispatch" | "claim";
export type PhotoSlot = "truck" | "weighbridge" | "moisture_meter" | "sample" | "dispatch_slip" | "other";

export interface Photo {
  id: string;
  mill_id: string;
  entity_type: PhotoEntityType;
  entity_id: string;
  slot: PhotoSlot;
  storage_path: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
  deleted_at: string | null;
}

export async function getSignedUploadUrl(opts: {
  mill_id: string;
  entity_type: PhotoEntityType;
  entity_id: string;
  slot: PhotoSlot;
  mime_type: string;
}): Promise<{ url: string; path: string; token: string }> {
  const admin = createAdminClient();
  const ext = opts.mime_type.includes("png") ? "png" : opts.mime_type.includes("webp") ? "webp" : "jpg";
  const path = `${opts.mill_id}/${opts.entity_type}/${opts.entity_id}/${opts.slot}-${Date.now()}.${ext}`;

  const { data, error } = await admin.storage
    .from("mill-photos")
    .createSignedUploadUrl(path);

  if (error || !data) throw new Error(`Failed to create signed upload URL: ${error?.message}`);

  return { url: data.signedUrl, path: data.path, token: data.token };
}

export async function registerPhoto(opts: {
  mill_id: string;
  entity_type: PhotoEntityType;
  entity_id: string;
  slot: PhotoSlot;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_by: string;
}): Promise<Photo> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Soft-delete any existing active photo for the same entity+slot
  await (admin.from("photos") as any)
    .update({ deleted_at: now })
    .eq("mill_id", opts.mill_id)
    .eq("entity_type", opts.entity_type)
    .eq("entity_id", opts.entity_id)
    .eq("slot", opts.slot)
    .is("deleted_at", null);

  const { data, error } = await admin
    .from("photos")
    .insert({
      mill_id: opts.mill_id,
      entity_type: opts.entity_type,
      entity_id: opts.entity_id,
      slot: opts.slot,
      storage_path: opts.storage_path,
      mime_type: opts.mime_type,
      file_size_bytes: opts.file_size_bytes,
      uploaded_by: opts.uploaded_by,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to register photo: ${error?.message}`);
  return data as unknown as Photo;
}

export async function listPhotos(opts: {
  entity_type: PhotoEntityType;
  entity_id: string;
}): Promise<Photo[]> {
  const admin = createAdminClient();
  const { data, error } = await (admin.from("photos") as any)
    .select("*")
    .eq("entity_type", opts.entity_type)
    .eq("entity_id", opts.entity_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Photo[];
}

export async function getSignedViewUrl(
  storage_path: string,
  expires_in_sec = 600
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("mill-photos")
    .createSignedUrl(storage_path, expires_in_sec);

  if (error || !data) throw new Error(`Failed to create view URL: ${error?.message}`);
  return data.signedUrl;
}

export async function softDeletePhoto(
  photo_id: string,
  session: Pick<Session, "mill_id" | "role" | "user_id">
): Promise<void> {
  const admin = createAdminClient();

  const { data: photo, error: fetchErr } = await (admin.from("photos") as any)
    .select("mill_id, uploaded_by, created_at, deleted_at")
    .eq("id", photo_id)
    .single();

  if (fetchErr || !photo) throw new Error("Photo not found");
  if (photo.mill_id !== session.mill_id) throw new Error("Forbidden");
  if (photo.deleted_at) throw new Error("Photo already deleted");

  const isOwnerOrManager = session.role === "owner" || session.role === "manager";
  const isUploaderWithin24h =
    photo.uploaded_by === session.user_id &&
    Date.now() - new Date(photo.created_at).getTime() < 24 * 60 * 60 * 1000;

  if (!isOwnerOrManager && !isUploaderWithin24h) {
    throw new Error("Forbidden");
  }

  const { error } = await (admin.from("photos") as any)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", photo_id);

  if (error) throw error;
}
