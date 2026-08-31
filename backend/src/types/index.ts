/**
 * Global TypeScript Type Definitions
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiRequest<T = any> {
  body?: T;
  query?: Record<string, any>;
  params?: Record<string, string>;
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  search?: string;
}

export interface FilterOptions {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like";
  value: any;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryOptions extends PaginationQuery {
  filters?: FilterOptions[];
  sorts?: SortOptions[];
}

export interface AuditLog {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SMSOptions {
  phone: string;
  message: string;
  templateId?: string;
  variables?: Record<string, any>;
}

export interface FileUploadOptions {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  destination: string;
  path: string;
  size: number;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

export interface WhatsAppMessage {
  to: string;
  type: "text" | "template" | "media" | "interactive";
  text?: string;
  templateName?: string;
  templateVariables?: Record<string, any>;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "document";
  interactive?: {
    type: string;
    body: string;
    buttons: Array<{
      type: string;
      title: string;
      id: string;
    }>;
  };
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
}
