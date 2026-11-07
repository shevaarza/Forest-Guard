'use client';

import React, { useMemo, useState } from 'react';
import {
  CameraDevice,
  DailyFireRiskReport,
  FireRiskPrediction,
  SystemAlert,
  WeatherData,
} from '@fire-monitoring/shared';
import { RuleBasedFireRiskModel } from '@/services/fire-risk.service';
import { DEFAULT_DASHBOARD, type DashboardBootstrap } from '@/lib/dashboard-bootstrap';
import { DashboardKpiSummary } from './DashboardKpiSummary';
const AlertsNotificationsModule = dynamic(() => import('./modules/AlertsNotificationModule').then(m => m.AlertsNotificationsModule));
const DailyReportsModule = dynamic(() => import('./modules/DailyReportsModule').then(m => m.DailyReportsModule));
const FireRiskAnalysisModule = dynamic(() => import('./modules/FireRiskAnalysisModule').then(m => m.FireRiskAnalysisModule));
const LiveCamerasModule = dynamic(() => import('./modules/LiveCamerasModule').then(m => m.LiveCamerasModule));
const SettingsModule = dynamic(() => import('./modules/SettingsModule').then(m => m.SettingsModule));
const SystemLogsModule = dynamic(() => import('./modules/SystemLogsModule').then(m => m.SystemLogsModule));
const WeatherMonitoringModule = dynamic(() => import('./modules/WeatherMonitoringModule').then(m => m.WeatherMonitoringModule));

import { Header } from '../layout/Header';
import { Sidebar } from '../layout/Sidebar';
import dynamic from 'next/dynamic';

const fireRiskModel = new RuleBasedFireRiskModel();

type MonitoringCenterShellProps = {
  initialData?: DashboardBootstrap;
};

export
  type ModuleTab =
  | 'Overview'
  | 'Weather Monitoring'
  | 'Live Cameras'
  | 'Fire Risk Analysis'
  | 'Daily Reports'
  | 'Alerts & Notifications'
  | 'System Logs'
  | 'Settings';

export default function MonitoringCenterShell({
  initialData,
}: MonitoringCenterShellProps): React.JSX.Element {
  const dashboard = initialData ?? DEFAULT_DASHBOARD;
  const [dryDays, setDryDays] = useState<number>(dashboard.dryDays);
  const [weather, setWeather] = useState<WeatherData>(dashboard.weather);
  const [cameras, setCameras] = useState<CameraDevice[]>(dashboard.cameras);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [newCamName, setNewCamName] = useState<string>('');
  const [newCamCode, setNewCamCode] = useState<string>('');
  const [newCamLocation, setNewCamLocation] = useState<string>('');
  const [newCamUrl] = useState<string>(
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  );
  const logs = dashboard.logs;
  const [reports, setReports] = useState<DailyFireRiskReport[]>(dashboard.reports);
  const [activeModule, setActiveModule] = useState<ModuleTab>('Overview');
  const [alerts, setAlerts] = useState(dashboard.alerts);;
  const role = dashboard.role;
  const riskPrediction: Omit<FireRiskPrediction, 'id' | 'predictedAt'> = useMemo(
    () => fireRiskModel.evaluate(weather, dryDays),
    [weather, dryDays]
  );

  const handleRegisterCamera = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!newCamName.trim() || !newCamCode.trim()) return;

    const created: CameraDevice = {
      id: `cam-${Date.now()}`,
      name: newCamName.trim(),
      code: newCamCode.trim(),
      location: newCamLocation.trim() || 'Sector D - Highland Perimeter',
      status: 'ONLINE',
      streamStatus: 'PLAYABLE',
      streamPlayable: true,
      streamProtocol: 'HLS',
      streamUrl: newCamUrl.trim(),
      isDemoStream: true,
      lastHeartbeatAt: new Date().toISOString(),
      lastConnectedAt: new Date().toISOString(),
      errorStatus: 'NONE',
      errorMessage: null,
      updatedAt: new Date().toISOString(),
    };

    setCameras((previous) => [created, ...previous]);
    setShowRegisterModal(false);
    setNewCamName('');
    setNewCamCode('');
    setNewCamLocation('');
  };

  const updateCameraState = (
    code: string,
    nextStatus: 'ONLINE' | 'OFFLINE',
    nextStreamStatus: 'PLAYABLE' | 'UNAVAILABLE'
  ): void => {
    setCameras((previous) =>
      previous.map((camera) => {
        if (camera.code !== code) return camera;
        const isPlayable = nextStatus === 'ONLINE' && nextStreamStatus === 'PLAYABLE';
        return {
          ...camera,
          status: nextStatus,
          streamStatus: nextStatus === 'OFFLINE' ? 'UNAVAILABLE' : nextStreamStatus,
          streamPlayable: isPlayable,
          errorStatus:
            nextStatus === 'OFFLINE'
              ? 'HARDWARE_FAULT'
              : isPlayable
                ? 'NONE'
                : 'INVALID_MANIFEST',
          errorMessage:
            nextStatus === 'OFFLINE'
              ? 'Camera transitioned to OFFLINE.'
              : isPlayable
                ? null
                : 'Invalid HLS stream (#EXTM3U check failed).',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const triggerExtremeDrySpell = (): void => {
    setDryDays(14);
    setWeather((previous: WeatherData): WeatherData => ({
      ...previous,
      temperatureC: 40.5,
      humidityPct: 19.0,
      windSpeedKmh: 39.0,
      uvIndex: 10.5,
      precipitationMm: 0.0,
      dataSource: 'DEMO_SIMULATION',
      isFallback: true,
      syncedAt: new Date().toISOString(),
    }));

    const extremeAlert: SystemAlert = {
      id: `alt-ext-${Date.now()}`,
      dedupKey: 'FIRE_RISK:EXTREME',
      title: 'Extreme Fire Susceptibility Detected (Score 96/100)',
      severity: 'CRITICAL',
      category: 'FIRE_RISK',
      status: 'CREATED',
      occurrenceCount: 1,
      lastSeenAt: new Date().toISOString(),
      description:
        'Heuristic environmental susceptibility reached EXTREME (40.5°C, 19% humidity, 14 dry days).',
      location: 'Sector A & Sector B',
      relatedCameraId: null,
      isRead: false,
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedAt: null,
      createdAt: new Date().toISOString(),
    };
    setAlerts((previous) => [extremeAlert, ...previous]);
  };

  const acknowledgeAlert = (id: string): void => {
    setAlerts((previous) =>
      previous.map((alert) =>
        alert.id === id
          ? {
            ...alert,
            status: 'ACKNOWLEDGED',
            acknowledged: true,
            isRead: true,
            acknowledgedBy: 'operator-01',
            acknowledgedAt: new Date().toISOString(),
          }
          : alert
      )
    );
  };

  const handleGenerateDailyReport = (): void => {
    const today = new Date().toISOString().slice(0, 10);
    const createdReport: DailyFireRiskReport = {
      id: `rep-${Date.now()}`,
      reportDate: today,
      maxTemperatureC: weather.temperatureC,
      avgWindSpeedKmh: weather.windSpeedKmh,
      totalPrecipitationMm: weather.precipitationMm,
      avgHumidityPct: weather.humidityPct,
      lastRainfallAt: weather.lastRainfallAt,
      dailyRiskScore: riskPrediction.riskScore,
      riskClassification: riskPrediction.classification,
      highestRiskPeriod: '13:30 - 15:30 WIB',
      vulnerableAreas: riskPrediction.vulnerableAreas,
      riskFactorAnalysis: `Environmental Susceptibility Report generated for ${today}: Risk score ${riskPrediction.riskScore}/100 (${riskPrediction.classification}).`,
      recommendedActions: [
        'Deploy patrol observation on high-susceptibility sectors.',
        'Confirm HLS stream playability across all online towers.',
      ],
      recordCount: 8,
      generatedAt: new Date().toISOString(),
    };
    setReports((previous) => [createdReport, ...previous]);
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