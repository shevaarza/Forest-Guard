import { CameraDevice } from "@fire-monitoring/shared";
import { Plus } from "lucide-react";
import { HlsVideoPlayer } from "../../camera/HlsVideoPlayer";

export function LiveCamerasModule({
  cameras,
  showRegisterModal,
  newCamName,
  newCamCode,
  newCamLocation,
  onRegisterCamera,
  onNewCamNameChange,
  onNewCamCodeChange,
  onNewCamLocationChange,
  onSetShowRegisterModal,
  onUpdateCameraState,
}: {
  cameras: CameraDevice[];
  showRegisterModal: boolean;
  newCamName: string;
  newCamCode: string;
  newCamLocation: string;
  onRegisterCamera: (event: React.FormEvent<HTMLFormElement>) => void;
  onNewCamNameChange: (value: string) => void;
  onNewCamCodeChange: (value: string) => void;
  onNewCamLocationChange: (value: string) => void;
  onSetShowRegisterModal: (value: boolean) => void;
  onUpdateCameraState: (
    code: string,
    nextStatus: 'ONLINE' | 'OFFLINE',
    nextStreamStatus: 'PLAYABLE' | 'UNAVAILABLE'
  ) => void;
}): React.JSX.Element {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#172033] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-100">
          Live CCTV Camera Fleet & Stream Validation
        </h2>
        <button
          type="button"
          onClick={() => onSetShowRegisterModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#38BDF8] px-3 py-1.5 text-xs font-semibold text-slate-950"
        >
          <Plus className="h-4 w-4" /> Register Camera
        </button>
      </div>

      {showRegisterModal && (
        <form
          onSubmit={onRegisterCamera}
          className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-slate-700 bg-[#111827] p-4 md:grid-cols-4"
        >
          <input
            placeholder="Camera Name"
            value={newCamName}
            onChange={(event) => onNewCamNameChange(event.target.value)}
            className="rounded border border-slate-700 bg-[#172033] px-3 py-1.5 text-xs text-slate-100"
            required
          />
          <input
            placeholder="Camera Code"
            value={newCamCode}
            onChange={(event) => onNewCamCodeChange(event.target.value)}
            className="rounded border border-slate-700 bg-[#172033] px-3 py-1.5 text-xs text-slate-100"
            required
          />
          <input
            placeholder="Sector / Location"
            value={newCamLocation}
            onChange={(event) => onNewCamLocationChange(event.target.value)}
            className="rounded border border-slate-700 bg-[#172033] px-3 py-1.5 text-xs text-slate-100"
            required
          />
          <button
            type="submit"
            className="rounded bg-[#22C55E] px-3 py-1.5 text-xs font-semibold text-slate-950"
          >
            Save Camera
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cameras.map((cam: CameraDevice) => (
          <div key={cam.id} className="rounded-lg border border-slate-800 bg-[#111827] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-100">{cam.name}</p>
                <p className="text-[11px] text-slate-400">
                  {cam.code} — {cam.location}
                </p>
              </div>
              <div className="flex gap-1.5">
                <span
                  data-testid={`status-badge-${cam.code}`}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${cam.status === 'ONLINE'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/20 text-red-300'
                    }`}
                >
                  {cam.status}
                </span>
                <span
                  data-testid={`stream-badge-${cam.code}`}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${cam.streamStatus === 'PLAYABLE'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-amber-500/20 text-amber-300'
                    }`}
                >
                  {cam.streamStatus}
                </span>
              </div>
            </div>

            <HlsVideoPlayer camera={cam} />

            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                data-testid={`set-online-${cam.code}`}
                onClick={() => onUpdateCameraState(cam.code, 'ONLINE', 'PLAYABLE')}
                className="rounded bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-300"
              >
                Set Online + Valid HLS
              </button>
              <button
                type="button"
                data-testid={`set-broken-stream-${cam.code}`}
                onClick={() => onUpdateCameraState(cam.code, 'ONLINE', 'UNAVAILABLE')}
                className="rounded bg-amber-500/15 px-2 py-1 text-[10px] text-amber-300"
              >
                Simulate Invalid HLS
              </button>
              <button
                type="button"
                data-testid={`set-offline-${cam.code}`}
                onClick={() => onUpdateCameraState(cam.code, 'OFFLINE', 'UNAVAILABLE')}
                className="rounded bg-red-500/15 px-2 py-1 text-[10px] text-red-300"
              >
                Set Offline
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
