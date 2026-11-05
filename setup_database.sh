#!/usr/bin/env bash
set -e

echo "====================================================================="
echo "        GreenLoop - Database Migration and Demo Reset                "
echo "====================================================================="
echo ""

echo "[1/2] Running PostgreSQL Migrations..."
npm run db:migrate

echo ""
echo "[2/2] Seeding initial clean demo listings and accounts..."
npm run db:clean

echo ""
echo "====================================================================="
echo "[SUCCESS] Database schema and demo data initialized cleanly!"
echo "====================================================================="
