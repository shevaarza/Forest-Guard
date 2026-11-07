'use client';

import React, { useMemo, useState } from 'react';
import {
  CameraDevice,
  DailyFireRiskReport,
  FireRiskPrediction,
  SystemAlert,
  WeatherData,
} from '@fire-monitoring/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { RuleBasedFireRiskModel } from '@/services/fire-risk.service';
import { DEFAULT_DASHBOARD, type DashboardBootstrap } from '@/lib/dashboard-bootstrap';
import {
  acknowledgeAlertAction,
  generateDailyReportAction,
  registerCameraAction,
  triggerExtremeDrySpellAction,
  updateCameraStateAction,
} from '@/actions';
import { DashboardKpiSummary } from './DashboardKpiSummary';
import { Header } from '../layout/Header';
import { Sidebar } from '../layout/Sidebar';

const AlertsNotificationsModule = dynamic(() => import('./modules/AlertsNotificationModule').then((m) => m.AlertsNotificationsModule));
const DailyReportsModule = dynamic(() => import('./modules/DailyReportsModule').then((m) => m.DailyReportsModule));
const FireRiskAnalysisModule = dynamic(() => import('./modules/FireRiskAnalysisModule').then((m) => m.FireRiskAnalysisModule));
const LiveCamerasModule = dynamic(() => import('./modules/LiveCamerasModule').then((m) => m.LiveCamerasModule));
const SettingsModule = dynamic(() => import('./modules/SettingsModule').then((m) => m.SettingsModule));
const SystemLogsModule = dynamic(() => import('./modules/SystemLogsModule').then((m) => m.SystemLogsModule));
const WeatherMonitoringModule = dynamic(() => import('./modules/WeatherMonitoringModule').then((m) => m.WeatherMonitoringModule));

const fireRiskModel = new RuleBasedFireRiskModel();

type MonitoringCenterShellProps = {
  initialData?: DashboardBootstrap;
  initialModule?: ModuleTab;
};

export type ModuleTab =
  | 'Overview'
  | 'Weather Monitoring'
  | 'Live Cameras'
  | 'Fire Risk Analysis'
  | 'Daily Reports'
  | 'Alerts & Notifications'
  | 'System Logs'
  | 'Settings';

const MODULES: ReadonlyArray<ModuleTab> = [
  'Overview',
  'Weather Monitoring',
  'Live Cameras',
  'Fire Risk Analysis',
  'Daily Reports',
  'Alerts & Notifications',
  'System Logs',
  'Settings',
];

export default function MonitoringCenterShell({
  initialData,
  initialModule = 'Overview',
}: MonitoringCenterShellProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dashboard = initialData ?? DEFAULT_DASHBOARD;
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [newCamName, setNewCamName] = useState<string>('');
  const [newCamCode, setNewCamCode] = useState<string>('');
  const [newCamLocation, setNewCamLocation] = useState<string>('');
  const [newCamUrl] = useState<string>('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');

  const weather: WeatherData = dashboard.weather;
  const dryDays = dashboard.dryDays;
  const cameras: CameraDevice[] = dashboard.cameras;
  const alerts: SystemAlert[] = dashboard.alerts;
  const logs = dashboard.logs;
  const reports: DailyFireRiskReport[] = dashboard.reports;
  const role = dashboard.role;

  const riskPrediction: Omit<FireRiskPrediction, 'id' | 'predictedAt'> = useMemo(
    () => fireRiskModel.evaluate(weather, dryDays),
    [weather, dryDays]
  );

  const rawModule = searchParams.get('module') ?? initialModule;
  const activeModule: ModuleTab = MODULES.includes(rawModule as ModuleTab)
    ? (rawModule as ModuleTab)
    : initialModule;

  const setActiveModule = (module: ModuleTab): void => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('module', module);
    router.push(`/?${nextParams.toString()}`, { scroll: false });
  };

  const handleRegisterCamera = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!newCamName.trim() || !newCamCode.trim()) return;

    const formData = new FormData();
    formData.set('name', newCamName.trim());
    formData.set('code', newCamCode.trim());
    formData.set('location', newCamLocation.trim() || 'Sector D - Highland Perimeter');
    formData.set('streamUrl', newCamUrl.trim());

    await registerCameraAction(formData);
    setShowRegisterModal(false);
    setNewCamName('');
    setNewCamCode('');
    setNewCamLocation('');
  };

  const updateCameraState = async (
    code: string,
    nextStatus: 'ONLINE' | 'OFFLINE',
    nextStreamStatus: 'PLAYABLE' | 'UNAVAILABLE'
  ): Promise<void> => {
    await updateCameraStateAction(code, nextStatus, nextStreamStatus);
  };

  const triggerExtremeDrySpell = async (): Promise<void> => {
    await triggerExtremeDrySpellAction({ weather, dryDays: 14 });
  };

  const acknowledgeAlert = async (id: string): Promise<void> => {
    await acknowledgeAlertAction(id);
  };

  const handleGenerateDailyReport = async (): Promise<void> => {
    await generateDailyReportAction({
      reportDate: new Date().toISOString().slice(0, 10),
      weather,
      riskScore: riskPrediction.riskScore,
      classification: riskPrediction.classification,
      vulnerableAreas: riskPrediction.vulnerableAreas,
      highestRiskPeriod: '13:30 - 15:30 WIB',
      recommendedActions: [
        'Deploy patrol observation on high-susceptibility sectors.',
        'Confirm HLS stream playability across all online towers.',
      ],
    });
  };

  const onlineCamerasCount = cameras.filter((camera) => camera.status === 'ONLINE').length;
  const offlineCamerasCount = cameras.filter((camera) => camera.status === 'OFFLINE').length;

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-[#F8FAFC]">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} alerts={alerts} />

      <div className="flex flex-1 flex-col">
        <Header weather={weather} roles={role} />

        <main className="flex-1 space-y-6 p-6">
          <DashboardKpiSummary
            weather={weather}
            riskPrediction={riskPrediction}
            onlineCamerasCount={onlineCamerasCount}
            offlineCamerasCount={offlineCamerasCount}
          />

          {(activeModule === 'Overview' || activeModule === 'Weather Monitoring') && (
            <WeatherMonitoringModule
              weather={weather}
              onTriggerExtremeDrySpell={triggerExtremeDrySpell}
            />
          )}

          {(activeModule === 'Overview' || activeModule === 'Live Cameras') && (
            <LiveCamerasModule
              cameras={cameras}
              showRegisterModal={showRegisterModal}
              newCamName={newCamName}
              newCamCode={newCamCode}
              newCamLocation={newCamLocation}
              onRegisterCamera={handleRegisterCamera}
              onNewCamNameChange={setNewCamName}
              onNewCamCodeChange={setNewCamCode}
              onNewCamLocationChange={setNewCamLocation}
              onSetShowRegisterModal={setShowRegisterModal}
              onUpdateCameraState={updateCameraState}
            />
          )}

          {activeModule === 'Fire Risk Analysis' && (
            <FireRiskAnalysisModule riskPrediction={riskPrediction} />
          )}

          {activeModule === 'Daily Reports' && (
            <DailyReportsModule
              reports={reports}
              onGenerateDailyReport={handleGenerateDailyReport}
            />
          )}

          {activeModule === 'Alerts & Notifications' && (
            <AlertsNotificationsModule
              alerts={alerts}
              onAcknowledgeAlert={acknowledgeAlert}
            />
          )}

          {activeModule === 'System Logs' && <SystemLogsModule logs={logs} role={role} />}

          {activeModule === 'Settings' && <SettingsModule />}
        </main>
      </div>
    </div>
  );
}