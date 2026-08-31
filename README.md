# Tenant Data Polish

Fix only src/repositories/tenantRepository.ts.

Make Tenant types match the Prisma schema, especially nullable occupation/emergencyPhone/permanentAddress fields.

Convert Prisma Decimal monthlyRent/securityDeposit to numbers.

Fix TenantStatus string errors using the Prisma enum.

Do not use any/ts-ignore.

Run npm run build.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b9451314-7f21-4ad3-9ea8-f247c54a6d4e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
