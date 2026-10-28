# Full Stack Project

A Node.js authentication API built with Express and MongoDB via Mongoose. The project currently contains an in-progress user registration endpoint.

## Requirements

- Node.js and npm
- A MongoDB instance, local or hosted

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and set the MongoDB connection string:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/full-stack-project
   ```

   Replace the example URI with your MongoDB connection string as needed.

3. Start the development server:

   ```bash
   npm run dev
   ```

   The server listens on port `3000`.

## API

The intended registration endpoint is:

```http
POST /api/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "username": "jane",
  "email": "jane@example.com",
  "password": "your-password"
}
```

Registration is not yet complete: the current controller checks for required fields and existing usernames or emails, but does not create a user or return a success response. The router is also mounted without a leading slash in `src/app.js`; correct that mount path before relying on the intended endpoint.

## Project structure

```text
server.js
src/
  app.js
  config/
    database.js
  controllers/
    auth.controller.js
  models/
    user.model.js
  routes/
    auth.routes.js
```
