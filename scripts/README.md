# Database Management Scripts

This directory contains scripts for managing the development database.

## 🚀 Quick Start

For most development scenarios, use:

```bash
npm run db:reset:script
```

This will:

- ⚠️ **Reset your entire database** (all data will be lost)
- 🔄 Run migrations to recreate tables
- ⚙️ Generate Prisma client
- 🌱 Seed the database with initial data
- ✅ Confirm completion

## 📋 Available Scripts

### NPM Scripts (Recommended)

| Script                     | Description                      | Use Case                        |
| -------------------------- | -------------------------------- | ------------------------------- |
| `npm run db:reset:script`  | **Full reset with confirmation** | Most common development reset   |
| `npm run db:reset`         | Same as `db:reset:confirm`       | Alias                           |
| `npm run db:reset:confirm` | Reset with migrations + generate | When you want migration history |
| `npm run db:reset:dev`     | Force reset + push schema        | Quick schema changes            |
| `npm run db:reset:full`    | Reset + seed manually            | Step-by-step control            |
| `npm run db:seed`          | Run seed script only             | Add initial data to existing DB |
| `npm run db:generate`      | Generate Prisma client           | After schema changes            |
| `npm run db:push`          | Push schema without migrations   | Development schema testing      |
| `npm run db:studio`        | Open Prisma Studio               | Database GUI                    |

### Shell Scripts

| Script                          | Description                   | Use Case            |
| ------------------------------- | ----------------------------- | ------------------- |
| `./scripts/db-reset.sh`         | Interactive reset with colors | Manual execution    |
| `./scripts/db-reset.sh --force` | Non-interactive reset         | CI/CD or automation |

## 🌱 Seed Data

The seed script (`prisma/seed.ts`) populates the database with:

### Games

- **VALORANT** (VAL) - Tactical 5v5 shooter
- **Overwatch 2** (OW2) - Team-based shooter
- **Super Smash Bros. Ultimate** (SSBU) - Platform fighter
- **Rocket League** (RL) - Vehicular soccer

### Schools

- **University of Gaming** (CA) - University level
- **Esports Institute** (TX) - College level
- **Gaming Academy High School** (WA) - High school level

## 🔧 Common Scenarios

### Prepared Statement Errors

If you get PostgreSQL prepared statement errors:

```bash
npm run db:reset:script
```

### Schema Changes

After modifying `prisma/schema.prisma`:

```bash
npm run db:push          # Quick test
# OR
npm run db:reset:script  # Full reset
```

### Fresh Start

Starting development or switching branches:

```bash
npm run db:reset:script
```

### Add Test Data Only

If you just want to add seed data:

```bash
npm run db:seed
```

## ⚠️ Important Notes

- **Development Only**: These scripts are for development environments
- **Data Loss**: All reset commands will **delete all data**
- **Confirmation**: The interactive script asks for confirmation
- **Force Mode**: Use `--force` flag to skip confirmation
- **Backup**: Always backup important data before resetting

## 🐛 Troubleshooting

### Permission Denied

```bash
chmod +x scripts/db-reset.sh
```

### Missing Dependencies

```bash
npm install --save-dev tsx ts-node --legacy-peer-deps
```

### Database Connection Issues

Check your `.env` file:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### Prisma Client Out of Sync

```bash
npm run db:generate
```

## 🔄 Workflow Examples

### Daily Development

```bash
# Start of day
npm run db:reset:script

# After schema changes
npm run db:push
npm run dev
```

### Feature Development

```bash
# Switch to feature branch
git checkout feature/new-feature

# Reset DB to clean state
npm run db:reset:script

# Work on feature...
npm run dev
```

### Testing

```bash
# Reset to known state
npm run db:reset:script

# Run tests
npm test
```
