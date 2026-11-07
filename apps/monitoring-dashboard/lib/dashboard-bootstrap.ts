import type {
  AlertRow,
  CameraDevice,
  CameraRow,
  DailyFireRiskReport,
  SystemAlert,
  SystemLogEntry,
  UserRole,
  WeatherData,
  WeatherRecordRow,
} from '@fire-monitoring/shared';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

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

function mapWeatherRow(row: WeatherRecordRow | null): WeatherData | null {
  if (!row) return null;

  return {
    id: String(row.id),
    stationId: String(row.station_id),
    locationName: String(row.location_name),
    temperatureC: Number(row.temperature_c ?? 0),
    windSpeedKmh: Number(row.wind_speed_kmh ?? 0),
    pressureHpa: row.pressure_hpa == null ? null : Number(row.pressure_hpa),
    uvIndex: row.uv_index == null ? null : Number(row.uv_index),
    solarRadiationWm2:
      row.solar_radiation_wm2 == null ? null : Number(row.solar_radiation_wm2),
    precipitationMm: Number(row.precipitation_mm ?? 0),
    lastRainfallAt: row.last_rainfall_at,
    humidityPct: Number(row.humidity_pct ?? 0),
    recordedAt: row.recorded_at,
    syncedAt: row.synced_at,
    isFallback: Boolean(row.is_fallback),
    dataSource: row.data_source ?? 'BMKG_LIVE',
  };
}

function mapCameraRow(row: CameraRow): CameraDevice {
  return {
    id: String(row.id),
    name: String(row.name),
    code: String(row.code),
    location: String(row.location),
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    status: row.status,
    streamStatus: row.stream_status,
    streamPlayable: Boolean(row.stream_playable),
    streamProtocol: row.stream_protocol,
    streamUrl: String(row.stream_url),
    isDemoStream: Boolean(row.is_demo_stream),
    lastHeartbeatAt: row.last_heartbeat_at,
    lastConnectedAt: row.last_connected_at,
    errorStatus: row.error_status,
    errorMessage: row.error_message,
    updatedAt: row.updated_at,
  };
}

function mapAlertRow(row: AlertRow): SystemAlert {
  return {
    id: String(row.id),
    dedupKey: row.dedup_key ?? row.id,
    title: String(row.title),
    severity: row.severity,
    category: row.category,
    status: row.status ?? (row.acknowledged ? 'ACKNOWLEDGED' : 'CREATED'),
    occurrenceCount: Number(row.occurrence_count ?? 1),
    lastSeenAt: row.last_seen_at ?? row.created_at,
    description: String(row.description),
    location: row.location ?? null,
    relatedCameraId: row.related_camera_id ?? null,
    isRead: Boolean(row.is_read),
    acknowledged: Boolean(row.acknowledged),
    acknowledgedBy: row.acknowledged_by ?? null,
    acknowledgedAt: row.acknowledged_at ?? null,
    resolvedAt: row.resolved_at ?? null,
    createdAt: row.created_at,
  };
}

function mapReportRow(row: Record<string, unknown>): DailyFireRiskReport {
  const recommendedActions = Array.isArray(row.recommended_actions)
    ? (row.recommended_actions as unknown[]).map((item) => String(item))
    : [];
  const vulnerableAreas = Array.isArray(row.vulnerable_areas)
    ? (row.vulnerable_areas as unknown[]).map((item) => String(item))
    : [];

  return {
    id: String(row.id ?? ''),
    reportDate: String(row.report_date ?? new Date().toISOString().slice(0, 10)),
    maxTemperatureC: row.max_temperature_c == null ? null : Number(row.max_temperature_c),
    avgWindSpeedKmh: row.avg_wind_speed_kmh == null ? null : Number(row.avg_wind_speed_kmh),
    totalPrecipitationMm:
      row.total_precipitation_mm == null ? null : Number(row.total_precipitation_mm),
    avgHumidityPct: row.avg_humidity_pct == null ? null : Number(row.avg_humidity_pct),
    lastRainfallAt: row.last_rainfall_at ? String(row.last_rainfall_at) : null,
    dailyRiskScore: Number(row.daily_risk_score ?? 0),
    riskClassification: String(row.risk_classification ?? 'LOW') as DailyFireRiskReport['riskClassification'],
    highestRiskPeriod: String(row.highest_risk_period ?? '13:30 - 15:30 WIB'),
    vulnerableAreas,
    riskFactorAnalysis: String(row.risk_factor_analysis ?? ''),
    recommendedActions,
    recordCount: Number(row.record_count ?? 0),
    generatedAt: row.generated_at ? String(row.generated_at) : new Date().toISOString(),
  };
}

export async function getDashboardBootstrap(): Promise<DashboardBootstrap> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_DASHBOARD;
  }

  try {
    const supabase = getServiceSupabase();

    const [weatherResult, camerasResult, alertsResult, reportsResult] = await Promise.all([
      supabase.from('weather_records').select('*').order('recorded_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('cameras').select('*').order('updated_at', { ascending: false }),
      supabase.from('alerts').select('*').order('created_at', { ascending: false }),
      supabase.from('daily_reports').select('*').order('generated_at', { ascending: false }).limit(10),
    ]);

    const weather = mapWeatherRow((weatherResult.data as WeatherRecordRow | null) ?? null) ?? DEFAULT_DASHBOARD.weather;
    const cameras = (camerasResult.data as CameraRow[] | null)?.map(mapCameraRow) ?? DEFAULT_DASHBOARD.cameras;
    const alerts = (alertsResult.data as AlertRow[] | null)?.map(mapAlertRow) ?? DEFAULT_DASHBOARD.alerts;
    const reports = (reportsResult.data as Record<string, unknown>[] | null)?.map(mapReportRow) ?? DEFAULT_DASHBOARD.reports;

    return {
      role: 'OPERATOR',
      dryDays: 6,
      weather,
      cameras,
      alerts,
      logs: DEFAULT_DASHBOARD.logs,
      reports,
    };
  } catch {
    return DEFAULT_DASHBOARD;
  }
}
