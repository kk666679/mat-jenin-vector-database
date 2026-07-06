#!/bin/bash

echo "🔄 Running database migrations..."

MIGRATIONS_DIR=".openclaw/migrations"
DB_URL=${DATABASE_URL:-"sqlite://.openclaw/openclaw.db"}

for migration in $(ls -1 $MIGRATIONS_DIR/*.sql | sort); do
    echo "📝 Applying migration: $(basename $migration)"
    
    if [[ $DB_URL == sqlite* ]]; then
        DB_PATH=$(echo $DB_URL | sed 's/sqlite:\/\///')
        sqlite3 $DB_PATH < $migration
    elif [[ $DB_URL == postgres* ]]; then
        psql $DB_URL -f $migration
    elif [[ $DB_URL == mysql* ]]; then
        mysql $DB_URL -e "source $migration"
    else
        echo "⚠️  Unsupported database, skipping migration"
    fi
    
    echo "✅ Migration $(basename $migration) applied"
done

echo "✅ All migrations completed!"
