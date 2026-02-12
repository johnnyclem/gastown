'use client';

import { useFilteredProjects, useTownMetrics } from '@/lib/store';
import { BuildingTile } from './building-tile';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  Clock,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function TownMap() {
  const projects = useFilteredProjects();
  const metrics = useTownMetrics();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Sky/Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40}%`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-white">Town Map</h1>
          </motion.div>
          <p className="text-slate-400 text-sm">
            Real-time view of all active projects and agents
          </p>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">Total Projects</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.totalProjects}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-slate-400">Blocked</span>
            </div>
            <div className="text-2xl font-bold text-amber-500">{metrics.blockedProjects}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-slate-400">Pending</span>
            </div>
            <div className="text-2xl font-bold text-violet-500">{metrics.pendingApprovals}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-slate-400">Active Agents</span>
            </div>
            <div className="text-2xl font-bold text-primary">{metrics.activeAgents}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-slate-400">Queue Health</span>
            </div>
            <div className="text-2xl font-bold text-emerald-500">
              {Math.round(metrics.mergeQueueHealth * 100)}%
            </div>
          </div>
        </motion.div>

        {/* Town Crier / Alerts */}
        {metrics.activeIncidents > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 bg-red-950/50 backdrop-blur-sm rounded-lg p-4 border border-red-900/50"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <motion.div
                  className="absolute inset-0 bg-red-500 rounded-full"
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <div className="font-medium text-red-200">
                  Town Crier Alert
                </div>
                <div className="text-sm text-red-400">
                  {metrics.activeIncidents} active incident{metrics.activeIncidents !== 1 ? 's' : ''} require{metrics.activeIncidents === 1 ? 's' : ''} attention
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Buildings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {projects.map((project, index) => (
            <BuildingTile key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No projects found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Ground/Street Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}
