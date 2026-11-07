'use server';

import { revalidatePath } from 'next/cache';
import type {
  AlertCategory,
  AlertSeverity,
  RiskClassification,
  WeatherData,
} from '@fire-monitoring/shared';
import { getServiceSupabase } from '@/lib/supabase';

const DEFAULT_STREAM_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export async function registerCameraAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const code = String(formData.get('code') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const streamUrl =
    String(formData.get('streamUrl') ?? DEFAULT_STREAM_URL).trim() || DEFAULT_STREAM_URL;

  if (!name || !code || !location) {
    return;
  }

  const supabase = getServiceSupabase();
  const { error } = await supabase.from('cameras').insert({
    name,
    code,
    location,
    status: 'ONLINE',
    stream_status: 'PLAYABLE',
    stream_playable: true,
    stream_protocol: 'HLS',
    stream_url: streamUrl,
    is_demo_stream: true,
    last_heartbeat_at: new Date().toISOString(),
    last_connected_at: new Date().toISOString(),
    error_status: 'NONE',
    error_message: null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
}

export async function updateCameraStateAction(
  code: string,
  nextStatus: 'ONLINE' | 'OFFLINE',
  nextStreamStatus: 'PLAYABLE' | 'UNAVAILABLE'
): Promise<void> {
  const supabase = getServiceSupabase();
  const isPlayable = nextStatus === 'ONLINE' && nextStreamStatus === 'PLAYABLE';

  const { error } = await supabase
    .from('cameras')
    .update({
      status: nextStatus,
      stream_status: nextStatus === 'OFFLINE' ? 'UNAVAILABLE' : nextStreamStatus,
      stream_playable: isPlayable,
      error_status:
        nextStatus === 'OFFLINE'
          ? 'HARDWARE_FAULT'
          : isPlayable
            ? 'NONE'
            : 'INVALID_MANIFEST',
      error_message:
        nextStatus === 'OFFLINE'
          ? 'Camera transitioned to OFFLINE.'
          : isPlayable
            ? null
            : 'Invalid HLS stream (#EXTM3U check failed).',
      updated_at: new Date().toISOString(),
    })
    .eq('code', code);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
}

export async function acknowledgeAlertAction(alertId: string): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('alerts')
    .update({
      status: 'ACKNOWLEDGED',
      is_read: true,
      acknowledged: true,
      acknowledged_by: 'operator-01',
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
}

export async function generateDailyReportAction(input: {
  reportDate: string;
  weather: WeatherData;
  riskScore: number;
  classification: RiskClassification;
  vulnerableAreas: string[];
  highestRiskPeriod?: string;
  recommendedActions?: string[];
}): Promise<void> {
  const supabase = getServiceSupabase();

  const { error } = await supabase.from('daily_reports').insert({
    report_date: input.reportDate,
    max_temperature_c: input.weather.temperatureC ?? 0,
    avg_wind_speed_kmh: input.weather.windSpeedKmh ?? 0,
    total_precipitation_mm: input.weather.precipitationMm ?? 0,
    avg_humidity_pct: input.weather.humidityPct ?? 0,
    last_rainfall_at: input.weather.lastRainfallAt,
    daily_risk_score: input.riskScore,
    risk_classification: input.classification,
    highest_risk_period: input.highestRiskPeriod ?? '13:30 - 15:30 WIB',
    vulnerable_areas: input.vulnerableAreas ?? [],
    risk_factor_analysis: `Environmental Susceptibility Report generated for ${input.reportDate}: Risk score ${input.riskScore}/100 (${input.classification}).`,
    recommended_actions: input.recommendedActions ?? [
      'Deploy patrol observation on high-susceptibility sectors.',
      'Confirm HLS stream playability across all online towers.',
    ],
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
}

export async function triggerExtremeDrySpellAction(input?: {
  weather: WeatherData;
  dryDays?: number;
}): Promise<void> {
  const supabase = getServiceSupabase();
  const nowIso = new Date().toISOString();
  const weather = input?.weather ?? {
    id: 'weather-extreme',
    stationId: 'SIM-EXTREME',
    locationName: 'Sector A & Sector B',
    temperatureC: 40.5,
    windSpeedKmh: 39,
    pressureHpa: 1006.5,
    uvIndex: 10.5,
    solarRadiationWm2: 0,
    precipitationMm: 0,
    lastRainfallAt: null,
    humidityPct: 19,
    recordedAt: nowIso,
    syncedAt: nowIso,
    isFallback: true,
    dataSource: 'DEMO_SIMULATION',
  };

  const { error: weatherError } = await supabase.from('weather_records').insert({
    station_id: weather.stationId,
    location_name: weather.locationName,
    temperature_c: weather.temperatureC ?? 0,
    wind_speed_kmh: weather.windSpeedKmh ?? 0,
    pressure_hpa: weather.pressureHpa ?? 1006.5,
    uv_index: weather.uvIndex ?? 10.5,
    solar_radiation_wm2: weather.solarRadiationWm2 ?? 0,
    precipitation_mm: weather.precipitationMm ?? 0,
    last_rainfall_at: weather.lastRainfallAt,
    humidity_pct: weather.humidityPct ?? 0,
    recorded_at: weather.recordedAt,
    synced_at: weather.syncedAt,
    is_fallback: true,
    data_source: 'DEMO_SIMULATION',
  });

  if (weatherError) {
    throw new Error(weatherError.message);
  }

  const alertDetails = {
    title: 'Extreme Fire Susceptibility Detected (Score 96/100)',
    severity: 'CRITICAL' as AlertSeverity,
    category: 'FIRE_RISK' as AlertCategory,
    status: 'CREATED',
    dedup_key: 'FIRE_RISK:EXTREME',
    occurrence_count: 1,
    last_seen_at: nowIso,
    description:
      'Heuristic environmental susceptibility reached EXTREME (40.5°C, 19% humidity, 14 dry days).',
    location: 'Sector A & Sector B',
    related_camera_id: null,
    is_read: false,
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_at: null,
    created_at: nowIso,
  };

  const { error: alertError } = await supabase.from('alerts').insert(alertDetails);

  if (alertError) {
    throw new Error(alertError.message);
  }

  revalidatePath('/');
}
