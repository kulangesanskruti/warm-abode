# File Storage API

All endpoints require authentication. Uploads use `multipart/form-data` with the `file` field.

- `POST /api/v1/files/upload` — generic upload; accepts `category`, `entityType`, `entityId`, `propertyId`, `tenantId`, `expiresAt`, and `isCover` fields.
- `POST /api/v1/files/profile-photo`
- `POST /api/v1/files/property-image`
- `POST /api/v1/files/tenant-document`
- `POST /api/v1/files/business-logo`
- `POST /api/v1/files/business-signature`
- `GET /api/v1/files` — owner-scoped search/filter/pagination.
- `GET /api/v1/files/:id` — returns metadata and records download history.
- `DELETE /api/v1/files/:id` — removes provider content and metadata.

Accepted files: JPG/JPEG/PNG/WEBP images up to 10 MB and PDFs up to 20 MB. Configure `FILE_STORAGE_PROVIDER=local` for development; the Cloudinary adapter remains an extension point until provider credentials and SDK are installed.
