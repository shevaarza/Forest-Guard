import React from 'react';
import MonitoringCenterShell, { type ModuleTab } from '@/components/dashboard/MonitoringCenterShell';
import { getDashboardBootstrap } from '@/lib/dashboard-bootstrap';

export default async function RootPage({
  searchParams,
}: {
  searchParams?: Promise<{ module?: string }>;
}) {
  const initialData = await getDashboardBootstrap();
  const params = (await searchParams) ?? {};
  const activeModule = (params.module as ModuleTab | undefined) ?? 'Overview';

  return <MonitoringCenterShell initialData={initialData} initialModule={activeModule} />;
}