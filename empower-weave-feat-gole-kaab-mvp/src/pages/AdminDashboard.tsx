import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers, getFlaggedComments, getAllUploads, getDashboardStats } from '@/integrations/supabase/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Loader2, Users, MessageSquare, FileText, Download } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery({ queryKey: ['allUsers'], queryFn: getAllUsers });
  const { data: flaggedComments, isLoading: isLoadingFlagged } = useQuery({ queryKey: ['flaggedComments'], queryFn: getFlaggedComments });
  const { data: uploads, isLoading: isLoadingUploads } = useQuery({ queryKey: ['allUploads'], queryFn: getAllUploads });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">{t('adminDashboard.title')}</h1>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats?.active_users || 0}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats?.total_posts || 0}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats?.total_comments || 0}</div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>User ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.user_id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.user_id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Comments for Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFlagged ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comment</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedComments?.map((comment: any) => (
                      <TableRow key={comment.id}>
                        <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                        <TableCell>{comment.moderation_reason}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUploads ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploads?.map((upload: any) => (
                      <TableRow key={upload.id}>
                        <TableCell>{upload.name}</TableCell>
                        <TableCell>{new Date(upload.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Download</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
