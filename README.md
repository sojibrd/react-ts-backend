# Express.js + TypeScript + TypeORM + PostgreSQL Starter

This project is a modular Express.js API using TypeScript, TypeORM, and PostgreSQL. It is prepared for implementing authentication features (email/password login, OAuth 2.0, OTP-based login, MFA, session management, rate limiting), but these are not yet implemented.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure your database connection using environment variables or edit the `AppDataSource` config in `src/index.ts`.
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   npm run start
   ```

## Scripts

- `build`: Compile TypeScript to JavaScript
- `start`: Run the server with ts-node

## Next Steps

- Add your TypeORM entities to the `entities` array in `src/index.ts`.
- Implement authentication and other features as needed.

---

**Note:** This project is structured to be modular and ready for advanced authentication features.
