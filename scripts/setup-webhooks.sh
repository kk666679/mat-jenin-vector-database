#!/bin/bash

echo "🔗 Matjenin Webhook Setup"
echo "=========================="
echo ""
echo "Domain: https://matjenin.space"
echo "Callback URL: https://matjenin.space/api/webhook/callback"
echo ""

# Generate webhook secret if not exists
if ! grep -q "WEBHOOK_SECRET" .env 2>/dev/null; then
    SECRET=$(openssl rand -hex 32)
    echo "WEBHOOK_SECRET=\"$SECRET\"" >> .env
    echo "✅ Generated webhook secret and added to .env"
else
    echo "✅ Webhook secret already configured"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Run: npm run db:generate && npm run db:push"
echo "2. Navigate to: http://localhost:3000/webhooks"
echo "3. Create your first webhook"
echo ""
echo "📖 Documentation: docs/WEBHOOKS.md"
