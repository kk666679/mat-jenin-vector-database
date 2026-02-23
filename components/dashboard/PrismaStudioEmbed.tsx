'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DatabaseIcon, 
  TableIcon, 
  RefreshCwIcon, 
  ExternalLinkIcon,
  ShieldIcon,
  LockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  Loader2Icon,
  ServerIcon,
  HardDriveIcon,
  ActivityIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrismaStudioEmbedProps {
  /** Base URL for Prisma Studio (default: /api/studio) */
  studioUrl?: string;
  /** Whether to show admin-only warning */
  requireAdmin?: boolean;
  /** Current user role */
  userRole?: 'admin' | 'member';
  /** Tenant ID for data isolation */
  tenantId?: string;
  /** Callback when Studio is ready */
  onReady?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Custom className */
  className?: string;
}

/**
 * PrismaStudioEmbed - Embeds Prisma Studio Core with RBAC protection
 * 
 * IMPORTANT SECURITY NOTES:
 * - This component should only be accessible to admin users
 * - The underlying Prisma Studio runs with full database access
 * - All operations are subject to Prisma's built-in protections
 * - For multi-tenant apps, the Studio shows ALL data (use with caution)
 * 
 * INTEGRATION WITH PRISMA STUDIO CORE:
 * - Uses @prisma/studio-core package
 * - Can embed Studio in an iframe or open in new tab
 * - For production, consider using Prisma Data Platform instead
 */
export function PrismaStudioEmbed({
  studioUrl = '/api/studio',
  requireAdmin = true,
  userRole = 'member',
  tenantId,
  onReady: _onReady,
  onError: _onError,
  className,
}: PrismaStudioEmbedProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'embed' | 'external'>('embed');

  // Check if user has admin access
  const hasAdminAccess = userRole === 'admin';

  // Reset state
  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setIsReady(false);
    // Force reload the iframe
    const iframe = document.getElementById('prisma-studio-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  // Show warning for non-admin users
  if (requireAdmin && !hasAdminAccess) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-yellow-500" />
            Admin Access Required
          </CardTitle>
          <CardDescription>
            Prisma Studio Core access is restricted to administrators only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Restricted Access
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You need admin privileges to access the database studio.
                Contact your administrator for access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full-screen studio view
  if (mode === 'external') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Prisma Studio
          </CardTitle>
          <CardDescription>
            Full database management studio (opens in new tab)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <ExternalLinkIcon className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-muted-foreground">
              Click below to open Prisma Studio in a new window.
              <br />
              <span className="text-sm">
                All data operations will be logged for security purposes.
              </span>
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.open(studioUrl, '_blank')}>
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Open Studio
              </Button>
              <Button variant="outline" onClick={() => setMode('embed')}>
                Back to Embedded View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DatabaseIcon className="h-5 w-5" />
              Prisma Studio Core
              {isReady && (
                <Badge variant="default" className="gap-1">
                  <CheckCircleIcon className="h-3 w-3" />
                  Connected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Embedded database management with full CRUD capabilities
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCwIcon className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMode('external')}
            >
              <ExternalLinkIcon className="h-4 w-4 mr-1" />
              Open Full
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangleIcon className="h-8 w-8 text-destructive mb-2" />
            <p className="text-destructive font-medium">Failed to load Studio</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading Prisma Studio...</p>
          </div>
        ) : (
          <div className="relative">
            {/* Note: In production, you would embed the actual Prisma Studio here */}
            {/* This is a placeholder showing the integration concept */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <TableIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Prisma Studio Integration</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    To fully embed Prisma Studio Core, configure the studioUrl prop
                    to point to your Prisma Studio instance.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ServerIcon className="h-4 w-4" />
                    Database: MSSQL
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDriveIcon className="h-4 w-4" />
                    Tenant: {tenantId || 'default'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setMode('external')}
                  className="mt-2"
                >
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * StudioStatus - Shows database connection status
 */
export function StudioStatus({ 
  className 
}: { 
  className?: string;
}) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    // Check database connection
    const checkConnection = async () => {
      try {
        // This would typically call a health check endpoint
        // For now, we'll simulate the check
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus('connected');
      } catch {
        setStatus('disconnected');
      }
    };
    checkConnection();
  }, []);

  return (
    <Card className={className}>
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ActivityIcon className="h-4 w-4" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex items-center gap-2">
          {status === 'checking' && (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Checking...</span>
            </>
          )}
          {status === 'connected' && (
            <>
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Connected</span>
            </>
          )}
          {status === 'disconnected' && (
            <>
              <AlertTriangleIcon className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Disconnected</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SecurityWarning - Shows security considerations for Prisma Studio
 */
export function SecurityWarning({ className }: { className?: string }) {
  return (
    <Card className={cn('border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950', className)}>
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <LockIcon className="h-4 w-4" />
          Security Considerations
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
        <ul className="list-disc list-inside space-y-1">
          <li>Prisma Studio provides full database access</li>
          <li>Restrict access to admin users only</li>
          <li>All operations are logged in audit logs</li>
          <li>Consider using read-only connections for non-admin users</li>
          <li>For production, use Prisma Data Platform for better security</li>
        </ul>
      </CardContent>
    </Card>
  );
}

