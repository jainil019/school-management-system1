# Client account workflow changes

Added role-aware account creation endpoints:
- POST /api/v1/students/create-account
- POST /api/v1/teachers/create-account
- POST /api/v1/parents/create-account

These endpoints create the User with the correct role and the profile in one transaction.

Student and teacher delete endpoints now clean up dependent school records where required and disable the linked login account rather than leaving an orphaned active login.
