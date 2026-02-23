'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { DashboardCharts, StatusBadge } from '@/components/dashboard/DashboardCharts';
import { PrismaStudioEmbed, StudioStatus, SecurityWarning } from '@/components/dashboard/PrismaStudioEmbed';
import { 
  FileTextIcon, 
  UsersIcon, 
  ActivityIcon, 
  KeyIcon, 
  MessageCircleIcon,
  ClockIcon,
  // CheckCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  DatabaseIcon,
  // BarChart3Icon,
  SettingsIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Types based on tRPC router response
interface DashboardStats {
  tenant: {
    name: string;
    plan: string;
    limits: {
      users: number;
      documents: number;
      storageMb: number;
      rateLimitRpm: number;
    };
  } | null;
  documents: {
    total: number;
    avgFileSize: number;
  };
  users: {
    total: number;
  };
  jobs: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  sessions: {
    active: number;
  };
  apiKeys: {
    active: number;
  };
  conversations: {
    total: number;
  };
  recentDocuments: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
  }>;
  recentJobs: Array<{
    id: string;
    type: string;
    status: string;
    progress: number;
    createdAt: Date;
  }>;
}

interface RecentDocument {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
}

interface RecentJob {
  id: string;
  type: string;
  status: string;
  progress: number;
  createdAt: Date;
}

// Sample data for demonstration (replace with tRPC queries in production)
const sampleStats: DashboardStats = {
  tenant: {
    name: 'Demo Tenant',
    plan: 'pro',
    limits: {
      users: 50,
      documents: 1000,
      storageMb: 5000,
      rateLimitRpm: 1000,
    },
  },
  documents: {
    total: 247,
    avgFileSize: 1024000,
  },
  users: {
    total: 12,
  },
  jobs: {
    total: 156,
    pending: 3,
    processing: 2,
    completed: 148,
    failed: 3,
  },
  sessions: {
    active: 8,
  },
  apiKeys: {
    active: 5,
  },
  conversations: {
    total: 89,
  },
  recentDocuments: [
    { id: '1', title: 'Q4 Financial Report', status: 'completed', createdAt: new Date() },
    { id: '2', title: 'Employee Handbook', status: 'processing', createdAt: new Date(Date.now() - 3600000) },
    { id: '3', title: 'Product Roadmap', status: 'pending', createdAt: new Date(Date.now() - 7200000) },
    { id: '4', title: 'Marketing Materials', status: 'completed', createdAt: new Date(Date.now() - 86400000) },
    { id: '5', title: 'Technical Specs', status: 'failed', createdAt: new Date(Date.now() - 172800000) },
  ],
  recentJobs: [
    { id: '1', type: 'embedding', status: 'completed', progress: 100, createdAt: new Date() },
    { id: '2', type: 'indexing', status: 'processing', progress: 67, createdAt: new Date(Date.now() - 1800000) },
    { id: '3', type: 'processing', status: 'pending', progress: 0, createdAt: new Date(Date.now() - 3600000) },
    { id: '4', type: 'embedding', status: 'completed', progress: 100, createdAt: new Date(Date.now() - 7200000) },
    { id: '5', type: 'indexing', status: 'failed', progress: 45, createdAt: new Date(Date.now() - 86400000) },
  ],
};

// Document columns for DataTable
const documentColumns: Column<RecentDocument>[] = [
  {
    key: 'title',
    header: 'Title',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    render: (item) => (
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </span>
    ),
  },
];

// Job columns for DataTable
const jobColumns: Column<RecentJob>[] = [
  {
    key: 'type',
    header: 'Type',
    sortable: true,
    render: (item) => (
      <Badge variant="outline" className="capitalize">
        {item.type}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: 'progress',
    header: 'Progress',
    render: (item) => (
      <div className="w-24">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              item.status === 'failed' 
                ? 'bg-red-500' 
                : item.status === 'completed' 
                  ? 'bg-green-500' 
                  : 'bg-primary'
            }`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{item.progress}%</span>
      </div>
    ),
  },
  {
    key: 'createdAt',
    header: 'Started',
    sortable: true,
    render: (item) => (
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </span>
    ),
  },
];

/**
 * Dashboard Page
 * 
 * Main dashboard showing:
 * - Key metrics (StatCards)
 * - Recent documents and jobs
 * - Charts for data visualization
 * - Prisma Studio integration
 */
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // In production, use tRPC hooks:
  // const { data: stats, isLoading, refetch } = trpc.dashboard.stats.useQuery();
  // const { data: recentDocs } = trpc.dashboard.recentItems.useQuery({ model: 'document', limit: 10 });
  
  const stats = sampleStats;

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh - in production, use refetch()
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Chart data for jobs status
  const jobStatusData = [
    { label: 'Completed', value: stats.jobs.completed },
    { label: 'Processing', value: stats.jobs.processing },
    { label: 'Pending', value: stats.jobs.pending },
    { label: 'Failed', value: stats.jobs.failed },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Overview of your {stats.tenant?.name || 'tenant'} data and operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/documents">
                <Button>
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="studio">Prisma Studio</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Documents"
                value={stats.documents.total.toLocaleString()}
                description={`Avg. ${formatBytes(stats.documents.avgFileSize)} per doc`}
                icon={FileTextIcon}
                variant="default"
              />
              <StatCard
                title="Active Users"
                value={stats.users.total}
                description={`Plan: ${stats.tenant?.plan || 'free'}`}
                icon={UsersIcon}
                variant="success"
              />
              <StatCard
                title="Active Sessions"
                value={stats.sessions.active}
                description="Currently logged in"
                icon={ActivityIcon}
              />
              <StatCard
                title="API Keys"
                value={stats.apiKeys.active}
                description="Active keys"
                icon={KeyIcon}
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Conversations"
                value={stats.conversations.total}
                description="Total RAG conversations"
                icon={MessageCircleIcon}
                className="border-l-4 border-l-purple-500"
              />
              <StatCard
                title="Jobs Running"
                value={stats.jobs.processing + stats.jobs.pending}
                description={`${stats.jobs.pending} pending, ${stats.jobs.processing} processing`}
                icon={ClockIcon}
                variant={stats.jobs.failed > 0 ? 'warning' : 'default'}
              />
              <StatCard
                title="Failed Jobs"
                value={stats.jobs.failed}
                description="Need attention"
                icon={AlertCircleIcon}
                variant={stats.jobs.failed > 0 ? 'danger' : 'success'}
              />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Status Chart */}
              <DashboardCharts
                title="Job Status"
                data={jobStatusData}
                type="bar"
                showTrend
              />

              {/* Recent Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Documents</CardTitle>
                  <CardDescription>Latest document uploads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentDocuments.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium truncate max-w-[200px]">{doc.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={doc.status} />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prisma Studio Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DatabaseIcon className="h-5 w-5" />
                      Database Overview
                    </CardTitle>
                    <CardDescription>Quick access to Prisma Studio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold">{stats.documents.total}</p>
                        <p className="text-sm text-muted-foreground">Documents</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold">{stats.users.total}</p>
                        <p className="text-sm text-muted-foreground">Users</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold">{stats.conversations.total}</p>
                        <p className="text-sm text-muted-foreground">Conversations</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold">{stats.jobs.total}</p>
                        <p className="text-sm text-muted-foreground">Jobs</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link href="?tab=studio">
                        <Button variant="outline">
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Open Prisma Studio
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <StudioStatus />
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>Browse and manage all documents</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={stats.recentDocuments}
                  columns={documentColumns}
                  keyField="id"
                  pageSize={10}
                  searchable
                  searchPlaceholder="Search documents..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Jobs</CardTitle>
                <CardDescription>View processing queue and job history</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={stats.recentJobs}
                  columns={jobColumns}
                  keyField="id"
                  pageSize={10}
                  searchable
                  searchPlaceholder="Search jobs..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prisma Studio Tab */}
          <TabsContent value="studio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PrismaStudioEmbed
                  userRole="admin"
                  tenantId={stats.tenant?.name || 'default'}
                  className="h-[600px]"
                />
              </div>
              <div className="space-y-6">
                <StudioStatus />
                <SecurityWarning />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/documents" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <FileTextIcon className="h-4 w-4 mr-2" />
                        Manage Documents
                      </Button>
                    </Link>
                    <Link href="/chat" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <MessageCircleIcon className="h-4 w-4 mr-2" />
                        View Conversations
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Tenant Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

