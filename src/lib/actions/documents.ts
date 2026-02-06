"use server";

import { db } from "@/db";
import { documents, deals } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  uploadToStorage,
  getSignedUrl,
  deleteFromStorage,
  generateStoragePath,
} from "@/lib/storage";

export interface Document {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  dealId: string;
  uploadedBy: string;
  createdAt: Date;
}

/**
 * Upload a document to storage and create a database record
 * @param dealId - The deal this document belongs to
 * @param file - The file to upload
 * @param userId - The user uploading the document
 * @returns The created document record or null on failure
 */
export async function uploadDocument(
  dealId: string,
  file: File,
  userId: string
): Promise<Document | null> {
  if (!dealId || !userId) {
    console.error("uploadDocument: Missing required parameters");
    return null;
  }

  try {
    // Get the deal to find the group ID for storage path
    const [deal] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, dealId))
      .limit(1);

    if (!deal) {
      console.error("uploadDocument: Deal not found");
      return null;
    }

    // Generate storage path: {group_id}/{deal_id}/{filename}
    const storagePath = generateStoragePath(deal.groupId, dealId, file.name);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await uploadToStorage(
      file,
      storagePath
    );

    if (uploadError || !uploadData) {
      console.error("uploadDocument: Storage upload failed", uploadError);
      return null;
    }

    // Create database record
    const [newDocument] = await db
      .insert(documents)
      .values({
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath,
        dealId,
        uploadedBy: userId,
      })
      .returning();

    return newDocument as Document;
  } catch (error) {
    console.error("uploadDocument error:", error);
    return null;
  }
}

/**
 * Get all documents for a deal
 * @param dealId - The deal ID
 * @returns Array of documents
 */
export async function getDocuments(dealId: string): Promise<Document[]> {
  if (!dealId) {
    return [];
  }

  try {
    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.dealId, dealId));

    return result as Document[];
  } catch (error) {
    console.error("getDocuments error:", error);
    return [];
  }
}

/**
 * Get a signed URL for downloading a document
 * @param id - Document ID
 * @returns Signed URL string or null
 */
export async function getDocumentUrl(id: string): Promise<string | null> {
  if (!id) {
    return null;
  }

  try {
    // Get document from database
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!doc) {
      console.error("getDocumentUrl: Document not found");
      return null;
    }

    // Get signed URL from storage
    const { data, error } = await getSignedUrl(doc.storagePath);

    if (error || !data?.signedUrl) {
      console.error("getDocumentUrl: Failed to generate signed URL", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("getDocumentUrl error:", error);
    return null;
  }
}

/**
 * Delete a document from storage and database
 * @param id - Document ID
 * @returns True if deleted, false otherwise
 */
export async function deleteDocument(id: string): Promise<boolean> {
  if (!id) {
    console.error("deleteDocument: No document ID provided");
    return false;
  }

  try {
    // Get document to find storage path
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!doc) {
      console.error("deleteDocument: Document not found");
      return false;
    }

    // Delete from storage (continue even if this fails)
    const { error: storageError } = await deleteFromStorage(doc.storagePath);
    if (storageError) {
      console.warn("deleteDocument: Storage deletion failed, continuing with DB deletion", storageError);
    }

    // Delete from database
    const [deletedDoc] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();

    return !!deletedDoc;
  } catch (error) {
    console.error("deleteDocument error:", error);
    return false;
  }
}
