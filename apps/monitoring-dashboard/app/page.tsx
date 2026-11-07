import React from 'react';
import MonitoringCenterShell from '@/components/dashboard/MonitoringCenterShell';
import { getDashboardBootstrap } from '@/lib/dashboard-bootstrap';

export default async function RootPage() {
  const initialData = await getDashboardBootstrap();

  return <MonitoringCenterShell initialData={initialData} />;
}