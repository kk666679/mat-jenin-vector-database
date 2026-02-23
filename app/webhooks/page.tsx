'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WebhooksPage() {
  const [webhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <Button onClick={() => setShowForm(true)}>Create Webhook</Button>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Callback URL</h2>
        <div className="flex gap-2">
          <Input 
            value="https://matjenin.space/api/webhook/callback" 
            readOnly 
            className="flex-1"
          />
          <Button variant="outline">Copy</Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Use this URL as your webhook callback endpoint
        </p>
      </Card>

      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Webhook</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input placeholder="My Webhook" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <Input placeholder="https://your-domain.com/webhook" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Events</label>
              <div className="space-y-2">
                {['document.created', 'document.processed', 'query.completed'].map(event => (
                  <label key={event} className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No webhooks configured</p>
          </Card>
        ) : (
          webhooks.map((webhook: any) => (
            <Card key={webhook.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{webhook.name}</h3>
                  <p className="text-sm text-gray-500">{webhook.url}</p>
                  <div className="flex gap-2 mt-2">
                    {JSON.parse(webhook.events).map((event: string) => (
                      <Badge key={event} variant="secondary">{event}</Badge>
                    ))}
                  </div>
                </div>
                <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                  {webhook.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
