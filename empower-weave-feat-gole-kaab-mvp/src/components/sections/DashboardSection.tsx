import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getPostsPerDay, getPosts } from '@/integrations/supabase/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, MessageSquare, TrendingUp, Calendar, Loader2 } from 'lucide-react';

export const DashboardSection = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: postsPerDay, isLoading: isLoadingChart } = useQuery({
    queryKey: ['postsPerDay'],
    queryFn: getPostsPerDay,
  });

  const { data: recentPosts, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recentPosts'],
    queryFn: () => getPosts().then(posts => posts.slice(0, 5)), // Get top 5 recent posts
  });

  return (
    <section id="dashboard" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Community Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time insights and analytics to track community engagement,
            resource sharing, and collective impact across all user groups.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-foreground">{stats?.active_users || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">Users who have posted or commented.</p>
            </CardContent>
          </Card>
          <Card className="bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Community Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-foreground">{stats?.total_posts || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">Total posts created by the community.</p>
            </CardContent>
          </Card>
          <Card className="bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-foreground">{stats?.total_comments || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">Total comments on all posts.</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <Card className="lg:col-span-2 bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Posts per Day (Last 30 Days)
              </CardTitle>
              <CardDescription>
                A look at community posting activity over the last month.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingChart ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <Tooltip
                      cursor={{fill: 'hsl(var(--accent))'}}
                      contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Posts
              </CardTitle>
              <CardDescription>
                The latest discussions from the community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRecent ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts?.map((post) => (
                    <div key={post.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <MessageSquare className="w-4 h-4 mt-1 text-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {post.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {post.author.display_name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    View All Posts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};