'use client';

import React, { useState } from 'react';
// import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { FileIcon, UploadIcon, RefreshCwIcon, CheckCircle2Icon, ClockIcon, AlertCircleIcon } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  status: string;
  chunkCount: number;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sample documents for demo
  const sampleDocuments: Document[] = [
    { id: '1', title: 'Getting Started Guide', status: 'completed', chunkCount: 45, createdAt: new Date().toISOString() },
    { id: '2', title: 'API Documentation', status: 'processing', chunkCount: 12, createdAt: new Date().toISOString() },
    { id: '3', title: 'User Manual', status: 'completed', chunkCount: 128, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // Use sample data for demo
      setDocuments(sampleDocuments);
    }
    setLoading(false);
  };

  // Load sample data on mount
  React.useEffect(() => {
    setDocuments(sampleDocuments);
  }, []);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);
    
    const formData = new FormData(event.currentTarget);
    
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      // Simulate upload for demo
      const newDoc: Document = {
        id: Date.now().toString(),
        title: formData.get('title') as string,
        status: 'processing',
        chunkCount: 0,
        createdAt: new Date().toISOString(),
      };
      setDocuments(prev => [newDoc, ...prev]);
    }
    setUploading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2Icon className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><ClockIcon className="w-3 h-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">Manage and upload your documents for RAG processing</p>
        </div>
        <Button onClick={fetchDocuments} disabled={loading} variant="outline">
          <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="w-5 h-5" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Upload a document to process and add to your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Title
              </label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Enter document title"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                File
              </label>
              <Input
                id="file"
                name="file"
                type="file"
                required
                accept=".txt,.md,.pdf,.docx"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
              {uploading && (
                <div className="flex-1 space-y-2">
                  <Progress value={45} className="h-2" />
                  <p className="text-xs text-muted-foreground">Processing document...</p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileIcon className="w-5 h-5" />
            Your Documents
          </CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? 's' : ''} in your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircleIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No documents yet. Upload one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.chunkCount} chunks • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

