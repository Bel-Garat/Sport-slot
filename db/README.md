# SportSlot – Database

## 1. Overview

SportSlot uses **PostgreSQL hosted on Supabase** as its shared development database.

The database is hosted in the cloud and is accessible to authorized members of the development team.

The backend will be developed using **Node.js, Express.js and Prisma ORM**.

Docker and a locally installed PostgreSQL server are not required because the database is hosted remotely.

### Application architecture

The planned data flow is:

**Frontend → API Gateway → Express Services → Prisma ORM → PostgreSQL (Supabase)**

Each component has a specific responsibility:

- **Frontend** – provides the user interface.
- **API Gateway** – routes incoming API requests to the appropriate backend service.
- **Express Services** – implement business logic and application endpoints.
- **Prisma ORM** – provides programmatic access to PostgreSQL from the backend.
- **PostgreSQL** – stores application data.
- **Supabase** – hosts and manages the PostgreSQL database.

Supabase Data API is disabled because SportSlot will implement its own REST API using Express.js.

Prisma will communicate with PostgreSQL using a database connection string. The connection method depends on the application's runtime environment.

## 2. Project information

| Property | Value |
|---|---|
| Organization | SportSlot |
| Supabase project | SportSlot-dev |
| Database provider | Supabase |
| Database engine | PostgreSQL |
| Region | West EU (Ireland), eu-west-1 |
| Environment | Development |
| Supabase plan | Free |
| Backend | Node.js + Express.js |
| ORM | Prisma (planned) |
| Current connection method | Session pooler |

The Supabase project contains a running PostgreSQL instance.

Application-specific tables will be created later using Prisma migrations based on the approved data model.

## 3. Requirements

To work with the shared database, developers need:

- Access to the SportSlot GitHub repository.
- Authorized database credentials provided privately by the project administrator.
- A local environment configuration file.
- Internet connectivity.

Optional development tools:

- PostgreSQL client (`psql`) for testing and database administration.
- Node.js and a package manager for backend development.
- Prisma ORM once the database implementation is configured.

A Supabase dashboard account is not required for a direct PostgreSQL client connection if valid database credentials have been provided.

## 4. Local environment setup

Environment configuration files are stored in the **root directory of the repository**.

### Environment files

| File | Purpose | Committed to Git |
|---|---|---|
| `.env.example` | Configuration template without real credentials | Yes |
| `.env` | Local configuration containing real credentials | No |

The `.env` file is excluded from version control through `.gitignore`.

### Step 1 – Clone the repository

```bash
git clone https://github.com/Bel-Garat/Sport-slot.git
cd Sport-slot
```

### Step 2 – Create the local environment file

From the repository root, run:

```bash
cp .env.example .env
```

This creates a local copy of the configuration template.

### Step 3 – Obtain database credentials

Request the development database connection information from an authorized project administrator.

Alternatively, authorized Supabase members can obtain the connection string through:

1. Sign in to the Supabase dashboard.
2. Open the **SportSlot** organization.
3. Select the **SportSlot-dev** project.
4. Click **Connect**.
5. Open **Direct → Connection Method**.
6. Select **Session pooler** when connecting from an IPv4-only environment.
7. Keep the connection string type set to **URI**.

The development environment has been successfully tested using the Session pooler on port `5432`.

### Step 4 – Configure DATABASE_URL

Open the root `.env` file and replace the placeholder connection string with the authorized database connection information.

Example structure:

```dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres?sslmode=require"
```

Replace `PROJECT_REF`, `PASSWORD`, and `POOLER_HOST` with the correct values.

This example is not a working connection string.

Connection string components:

- `postgresql://` – PostgreSQL connection protocol.
- `postgres.PROJECT_REF` – database username used by the Supabase shared pooler.
- `PASSWORD` – database password.
- `POOLER_HOST` – Supabase pooler hostname.
- `5432` – Session pooler port.
- `/postgres` – default database name.
- `sslmode=require` – requires an encrypted PostgreSQL connection.

Passwords containing special URL characters must be percent-encoded.

Never commit the real connection string or password to Git.

**Important:** Creating `.env` does not automatically connect the application to PostgreSQL. Backend processes must load the environment configuration, and Prisma must be configured separately.

## 5. PostgreSQL connection methods

Supabase provides multiple PostgreSQL connection methods.

### Direct connection – port 5432

Connects directly to PostgreSQL without the Supabase shared connection pooler.

Recommended for persistent applications, administrative tools, and database migrations when network connectivity allows it.

Direct connections normally require IPv6 connectivity on the Supabase Free plan.

### Session pooler – port 5432

Uses a Supabase connection pooler that maintains session-level database connection behavior.

Suitable for persistent backend applications and development environments that require IPv4 connectivity.

**This is the connection method currently tested for SportSlot development.**

### Transaction pooler – port 6543

Shares database connections between short transactions.

Primarily designed for serverless applications and environments with many short-lived database connections.

Some PostgreSQL session features and prepared-statement behaviors require special consideration.

### Choosing a connection method

For the current local development setup, the Session pooler is a supported option.

For future backend deployment, the connection method should be evaluated according to the hosting platform and its network capabilities.

The Prisma connection configuration will be finalized during the database implementation task.

## 6. Database connection verification

Connection verification consists of two separate checks.

### Test A – Supabase SQL Editor

Open **SportSlot-dev → SQL Editor** in the Supabase dashboard.

Execute:

```sql
SELECT
    current_database() AS database_name,
    current_user AS database_user,
    NOW() AS server_time,
    version() AS postgres_version;
```

This query retrieves information about the connected PostgreSQL database.

It does not create, modify, or delete data.

A successful result confirms that PostgreSQL is running and can execute SQL queries through the Supabase dashboard.

### Test B – External PostgreSQL connection

To verify that PostgreSQL is reachable outside Supabase, use the PostgreSQL command-line client `psql`.

On macOS with Homebrew, client tools can be installed using:

```bash
brew install libpq
```

Verify the installation:

```bash
"$(brew --prefix libpq)/bin/psql" --version
```

Connect using the Supabase Session pooler:

```bash
"$(brew --prefix libpq)/bin/psql" \
  "host=POOLER_HOST port=5432 dbname=postgres user=postgres.PROJECT_REF sslmode=require" \
  -W
```

Replace the placeholder host and username with the actual connection parameters from Supabase.

The `-W` option prompts for the database password interactively, avoiding the need to include it in the command itself.

After a successful connection, the terminal displays a PostgreSQL prompt such as:

```text
postgres=>
```

Execute:

```sql
SELECT current_database(), current_user;
```

A successful result confirms that the local PostgreSQL client can connect to the remote database and execute queries.

Disconnect using:

```text
\q
```

**Important:** This test verifies external PostgreSQL connectivity. It does not verify Prisma or Express integration.

## 7. Prisma ORM and database migrations

The database schema will be managed through **Prisma ORM**.

The schema will be based on the approved SportSlot data model, including its entities, attributes, and relationships.

Planned structure:

```text
db/
├── README.md
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### Prisma schema

The `schema.prisma` file describes the application's database models, fields, data types, and relationships.

### Prisma migrations

Prisma migrations translate changes in the database schema into SQL operations that create or update PostgreSQL structures.

Migrations must be reviewed before being applied to the shared development database.

The Prisma version, dependencies, configuration, and migration commands will be established during the second S1W1 database task.

The actual Prisma integration has **not yet been implemented**.

## 8. Security guidelines

All developers must follow these rules:

- Never commit `.env` files or real credentials.
- Never expose database credentials to frontend code.
- Never include passwords in Pull Requests, issues, screenshots, or public documentation.
- Share credentials only through approved private channels.
- Grant access only to authorized team members.
- Prefer limited database privileges where practical.
- Coordinate all database schema changes with the backend team.
- Do not manually modify shared database structures outside the agreed migration process.
- Rotate credentials immediately if they are exposed.

The main PostgreSQL database account has elevated privileges and should not be distributed unnecessarily.

## 9. Team collaboration

The development database is shared across the SportSlot backend team.

Each developer should maintain their own local environment configuration.

Authorized developers connect to the same cloud PostgreSQL database using approved credentials.

GitHub stores the shared application code, Prisma schema, migration files, and documentation.

**Git branches do not create independent PostgreSQL databases.**

Database schema changes must be coordinated because they can affect other developers using the shared instance.

Each implementation task should be developed in a dedicated Git branch and submitted through a Pull Request.

Repository: https://github.com/Bel-Garat/Sport-slot

## 10. Current status

Completed:

- Supabase organization created.
- PostgreSQL development project created.
- Database health confirmed in Supabase.
- SQL queries executed successfully in Supabase SQL Editor.
- External PostgreSQL connection tested successfully using `psql` on macOS.
- Session pooler connection verified on port `5432`.
- Root environment configuration template prepared.
- Database setup documentation prepared.

Pending:

- Complete secure database access handover to the development team.
- Complete Pull Request review and merge.
- Configure Prisma ORM in the repository.
- Implement the approved database schema.
- Create and apply initial Prisma migrations.
- Verify backend-to-database integration through Prisma.

The database infrastructure is ready for further backend development. Application-level database integration will be completed in the next task.