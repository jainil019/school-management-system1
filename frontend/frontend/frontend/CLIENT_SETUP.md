# SchoolMS Client-Ready Frontend

## Start

1. Start PostgreSQL.
2. Start FastAPI from the backend project:
   `uvicorn app.main:app --reload`
3. Copy `.env.example` to `.env` if you need a different API URL.
4. Run `npm install`.
5. Run `npm run dev`.

## Admin people management

Students, teachers and parents can be created directly from the UI. The form creates the role-specific login account and profile together, so the administrator does not need to know or enter a database User ID.

Students and teachers support edit and delete actions. Delete requires confirmation. The backend removes the profile and dependent school records where appropriate and disables the associated login account instead of leaving an orphaned login.

## Important

Never put production database passwords or JWT secrets in the frontend. The frontend only needs the public API base URL.
