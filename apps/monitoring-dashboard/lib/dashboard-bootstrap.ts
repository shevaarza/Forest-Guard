import type {
  CameraDevice,
  DailyFireRiskReport,
  SystemAlert,
  SystemLogEntry,
  UserRole,
  WeatherData,
} from '@fire-monitoring/shared';

export interface DashboardBootstrap {
  role: UserRole;
  dryDays: number;
  weather: WeatherData;
  cameras: CameraDevice[];
  alerts: SystemAlert[];
  logs: SystemLogEntry[];
  reports: DailyFireRiskReport[];
}

export const DEFAULT_DASHBOARD: DashboardBootstrap = {
  role: 'OPERATOR',
  dryDays: 6,
  weather: {
    id: 'w-init-01',
    stationId: '35.73.01.1001',
    locationName: 'Malang Highland Sector A',
    temperatureC: 31.8,
    windSpeedKmh: 21.4,
    pressureHpa: null,
    uvIndex: null,
    solarRadiationWm2: null,
    precipitationMm: 0.0,
    lastRainfallAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    humidityPct: 44.0,
    recordedAt: new Date().toISOString(),
    syncedAt: new Date().toISOString(),
    isFallback: false,
    dataSource: 'BMKG_LIVE',
  },
  cameras: [
    {
      id: 'cam-01',
      name: 'Tower Alpha - North Pine Ridge',
      code: 'CCTV-MLG-01',
      location: 'Sector A - North Pine Ridge',
      status: 'ONLINE',
      streamStatus: 'PLAYABLE',
      streamPlayable: true,
      streamProtocol: 'HLS',
      streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      isDemoStream: true,
      lastHeartbeatAt: new Date().toISOString(),
      lastConnectedAt: new Date().toISOString(),
      errorStatus: 'NONE',
      errorMessage: null,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cam-02',
      name: 'Tower Bravo - Savanna Basin',
      code: 'CCTV-MLG-02',
      location: 'Sector B - Savanna Basin',
      status: 'ONLINE',
      streamStatus: 'UNAVAILABLE',
      streamPlayable: false,
      streamProtocol: 'HLS',
      streamUrl: 'https://invalid-relay.local/live.m3u8',
      isDemoStream: true,
      lastHeartbeatAt: new Date().toISOString(),
      lastConnectedAt: new Date().toISOString(),
      errorStatus: 'STREAM_UNREACHABLE',
      errorMessage: 'Camera is ONLINE, but #EXTM3U manifest validation failed (HTTP 502)',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cam-03',
      name: 'Tower Charlie - East Corridor',
      code: 'CCTV-MLG-03',
      location: 'Sector C - East Transmission Corridor',
      status: 'OFFLINE',
      streamStatus: 'UNAVAILABLE',
      streamPlayable: false,
      streamProtocol: 'HLS',
      streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      isDemoStream: true,
      lastHeartbeatAt: new Date(Date.now() - 3600_000).toISOString(),
      lastConnectedAt: new Date(Date.now() - 7200_000).toISOString(),
      errorStatus: 'HEARTBEAT_EXPIRED',
      errorMessage: 'Camera heartbeat expired (>90s without telemetry).',
      updatedAt: new Date().toISOString(),
    },
  ],
  alerts: [
    {
      id: 'alt-init-1',
      dedupKey: 'CAMERA_STREAM_UNAVAILABLE:cam-02',
      title: 'HLS Stream Unavailable on Online Camera (CCTV-MLG-02)',
      severity: 'WARNING',
      category: 'CAMERA',
      status: 'CREATED',
      occurrenceCount: 1,
      lastSeenAt: new Date().toISOString(),
      description: 'Tower Bravo is ONLINE, but HLS manifest validation returned HTTP 502.',
      location: 'Sector B - Savanna Basin',
      relatedCameraId: 'cam-02',
      isRead: false,
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedAt: null,
      createdAt: new Date().toISOString(),
    },
  ],
  logs: [
    {
      id: 'log-init-1',
      timestamp: new Date().toISOString(),
      level: 'WARN',
      httpStatus: 502,
      errorCategory: 'STREAM_FAILURE',
      message: 'HLS probe failed for CCTV-MLG-02: missing #EXTM3U header',
      requestEndpoint: 'https://invalid-relay.local/live.m3u8',
      requestMethod: 'GET',
      sourceService: 'CameraSyncService',
      stackTrace:
        'Error: HLS 502 Bad Gateway\n    at CameraSyncService.probeManifest (camera.service.ts:112:15)',
    },
  ],
  reports: [
    {
      id: 'rep-2026-11-06',
      reportDate: '2026-11-06',
      maxTemperatureC: 33.4,
      avgWindSpeedKmh: 21.4,
      totalPrecipitationMm: 0.0,
      avgHumidityPct: 44.0,
      lastRainfallAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
      dailyRiskScore: 54,
      riskClassification: 'MODERATE',
      highestRiskPeriod: '13:00 - 15:00 WIB',
      vulnerableAreas: ['Sector B - Savanna Basin'],
      riskFactorAnalysis:
        'Environmental Susceptibility Report: Warm temperatures and 6 dry days elevated afternoon susceptibility.',
      recommendedActions: [
        'Maintain 15-minute BMKG synchronization cadence.',
        'Inspect HLS relay on Tower Bravo (CCTV-MLG-02).',
      ],
      recordCount: 8,
      generatedAt: new Date().toISOString(),
    },
  ],
};

export async function getDashboardBootstrap(): Promise<DashboardBootstrap> {
  await Promise.resolve();

  return {
    ...DEFAULT_DASHBOARD,
    weather: {
      ...DEFAULT_DASHBOARD.weather,
      recordedAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    },
    cameras: DEFAULT_DASHBOARD.cameras.map((camera) => ({
      ...camera,
      updatedAt: new Date().toISOString(),
      lastConnectedAt: camera.lastConnectedAt ?? new Date().toISOString(),
      lastHeartbeatAt: camera.lastHeartbeatAt ?? new Date().toISOString(),
    })),
    alerts: DEFAULT_DASHBOARD.alerts.map((alert) => ({
      ...alert,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    })),
    logs: DEFAULT_DASHBOARD.logs.map((log) => ({
      ...log,
      timestamp: new Date().toISOString(),
    })),
    reports: DEFAULT_DASHBOARD.reports.map((report) => ({
      ...report,
      generatedAt: new Date().toISOString(),
    })),
  };
}
