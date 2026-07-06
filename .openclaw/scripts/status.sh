#!/bin/bash

echo "📊 OpenClaw System Status"
echo "========================"
echo ""

# Check Redis
echo "🐱 Redis:"
if nc -z localhost 6379 2>/dev/null; then
    echo "  ✅ Running on localhost:6379"
    REDIS_STATUS="running"
else
    echo "  ❌ Not running"
    REDIS_STATUS="stopped"
fi

# Check Weaviate
echo ""
echo "🔍 Weaviate:"
if curl -s http://localhost:8080/v1/.well-known/health > /dev/null 2>&1; then
    echo "  ✅ Running on localhost:8080"
    WEAVIATE_STATUS="running"
else
    echo "  ❌ Not running"
    WEAVIATE_STATUS="stopped"
fi

# Check SQL Server
echo ""
echo "🗄️  SQL Server:"
if nc -z localhost 1433 2>/dev/null; then
    echo "  ✅ Running on localhost:1433"
    SQL_STATUS="running"
else
    echo "  ❌ Not running"
    SQL_STATUS="stopped"
fi

# Check API
echo ""
echo "🌐 API:"
if curl -s http://localhost:3000/api/openclaw > /dev/null 2>&1; then
    echo "  ✅ API responding on port 3000"
    API_STATUS="running"
else
    echo "  ❌ API not responding"
    API_STATUS="stopped"
fi

# Summary
echo ""
echo "📋 Summary:"
echo "  Redis: $REDIS_STATUS"
echo "  Weaviate: $WEAVIATE_STATUS"
echo "  SQL Server: $SQL_STATUS"
echo "  API: $API_STATUS"

echo ""
echo "✅ Status check completed!"
