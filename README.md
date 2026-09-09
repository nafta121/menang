# ShiftKu

## Deploying to Vercel

1. Provision a PostgreSQL database and add its connection string as `DATABASE_URL` in **Vercel → Project Settings → Environment Variables** for Preview and Production. Use `.env.example` as the format reference.
2. Deploy normally. The `build` script runs `prisma generate` before `next build`, ensuring that the Prisma Client is present in Vercel's build environment.
3. Apply migrations from a trusted CI job or workstation with `npx prisma migrate deploy`, then seed the initial seven employees with `npm run db:seed`.

`POST /api/schedule/generate` deliberately returns `409` when the requested month has locked cells or when the configured constraints are infeasible. This protects persisted requests from being overwritten during deployment or schedule regeneration.
