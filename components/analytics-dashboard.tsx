"use client";

import { JobEntry } from "@/db/schema";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Award, CalendarCheck, Target } from "lucide-react";

interface AnalyticsDashboardProps {
  entries: JobEntry[];
}

export function AnalyticsDashboard({ entries }: AnalyticsDashboardProps) {
  // 1. Calculate Status Distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      const status = entry.applicationStatus;
      counts[status] = (counts[status] || 0) + 1;
    });

    const data = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Sort by value desc
    return data.sort((a, b) => b.value - a.value);
  }, [entries]);

  // 2. Calculate Weekly Activity (Last 7 Days)
  const weeklyData = useMemo(() => {
    const last7Days = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      return d;
    }).reverse();

    const data = last7Days.map(date => {
      const count = entries.filter(e => {
        const entryDate = new Date(e.dateAppliedOrContacted);
        entryDate.setHours(0,0,0,0);
        return entryDate.getTime() === date.getTime();
      }).length;

      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        applications: count
      };
    });

    return data;
  }, [entries]);

  // 3. Stats
  const total = entries.length;
  const interviews = entries.filter(e => e.applicationStatus === "InterviewScheduled").length;
  const offers = entries.filter(e => e.applicationStatus === "Offer").length;
  // Calculate success rate (Interview + Offer) / Total
  const successRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">Applications to Interviews</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offers}</div>
              <p className="text-xs text-muted-foreground">Job offers received</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-violet-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviews}</div>
              <p className="text-xs text-muted-foreground">Scheduled interviews</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">Lifetime tracked</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={item} className="col-span-4">
           <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Application statuses distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            backdropFilter: 'blur(4px)'
                        }}
                        itemStyle={{ color: '#1e293b' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item} className="col-span-3">
            <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>
                Applications sent in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            backdropFilter: 'blur(4px)'
                        }}
                        labelStyle={{ color: '#64748b' }}
                    />
                    <Bar 
                        dataKey="applications" 
                        fill="#6366f1" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                    />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
