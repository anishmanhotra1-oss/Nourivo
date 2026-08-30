import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Play, Pause, Square, Flame, Timer, Gauge, Navigation, History,
  Activity, Volume2, VolumeX, Lock, LockOpen, Target,
  AlertCircle, MapPin, Footprints, Mountain, Zap, ChevronRight, Eye
} from 'lucide-react';
import { workoutService } from '../services/api';
import { voiceCoPilot } from '../services/voiceCoPilot';
import { gpsTracker, GpsPoint, GpsStats } from '../services/gpsTracker';
import { motionSensorManager, MotionState } from '../services/motionSensorManager';
import { detectActivityState, ActivityState } from '../services/sensorFusionEngine';
import { formatPace } from '../services/paceCalculator';
import { db, RunRecord } from '../db/dexie';
import { GoogleMapView } from '../components/workout/GoogleMapView';
import { GhostBattleOverlay } from '../components/workout/GhostBattleOverlay';
import { WorkoutSummaryModal } from '../components/workout/WorkoutSummaryModal';
import { LocationPermissionModal } from '../components/workout/LocationPermissionModal';
import { GpsTargetCalculatorModal } from '../components/workout/GpsTargetCalculatorModal';
import { FinishConfirmationModal } from '../components/workout/FinishConfirmationModal';
import { RunDetailModal } from '../components/workout/RunDetailModal';
import { Tooltip } from '../components/common/Tooltip';

const ACTIVITY_PROFILES: Record<string, { name: string; met: number; label: string }> = {
  running: { name: 'Running', met: 9.8, label: '🏃 Running' },
  walking: { name: 'Walking', met: 3.8, label: '🚶 Walking' },
  cycling: { name: 'Cycling', met: 7.5, label: '🚴 Cycling' },
  hiking: { name: 'Hiking', met: 6.0, label: '🥾 Hiking' },
};

export const WorkoutPage: React.FC = () => {
  const [workoutSessionHistory, setWorkoutSessionHistory] = useState<any[]>([]);
  const [localRunHistory, setLocalRunHistory] = useState<RunRecord[]>([]);
  const [selectedActivityType, setSelectedActivityType] = useState('running');
  const [isSessionTracking, setIsSessionTracking] = useState(false);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [isGhostActive, setIsGhostActive] = useState(false);
  const [isVoiceCoPilotMuted, setIsVoiceCoPilotMuted] = useState(false);

  // GPS Target Goal State
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [activeTargetDistanceKm, setActiveTargetDistanceKm] = useState<number>(5.0);
  const [activeTargetPaceMinKm, setActiveTargetPaceMinKm] = useState<string>('5:30 min/km');

  // Modal States
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryModalData, setSummaryModalData] = useState<any | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [isRunDetailOpen, setIsRunDetailOpen] = useState(false);
  const [selectedRunDetail, setSelectedRunDetail] = useState<RunRecord | null>(null);

  // Permission & WakeLock
  const [gpsPermissionState, setGpsPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // GPS Telemetry State
  const [gpsCoordinatesPath, setGpsCoordinatesPath] = useState<[number, number][]>([]);
  const [currentUserLocation, setCurrentUserLocation] = useState<[number, number] | null>(null);
  const [sessionDistanceKm, setSessionDistanceKm] = useState(0);
  const [activeDurationSeconds, setActiveDurationSeconds] = useState(0);
  const [elapsedDurationSeconds, setElapsedDurationSeconds] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [averageSpeedKmh, setAverageSpeedKmh] = useState(0);
  const [peakSpeedKmh, setPeakSpeedKmh] = useState(0);
  const [currentPaceMinKm, setCurrentPaceMinKm] = useState(0);
  const [averagePaceMinKm, setAveragePaceMinKm] = useState(0);
  const [estimatedCaloriesBurned, setEstimatedCaloriesBurned] = useState(0);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [elevationGainMeters, setElevationGainMeters] = useState(0);
  const [headingAngle, setHeadingAngle] = useState(0);
  const [isAutoPausedState, setIsAutoPausedState] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);

  // Motion Sensor State
  const [cadenceSpm, setCadenceSpm] = useState(0);
  const [activityState, setActivityState] = useState<ActivityState>('stationary');
  const [motionStepCount, setMotionStepCount] = useState(0);

  const durationTimerRef = useRef<any>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);
  const latestMotionRef = useRef<MotionState | null>(null);

  const currentProfile = ACTIVITY_PROFILES[selectedActivityType] || ACTIVITY_PROFILES.running;

  // Load workout history
  const fetchWorkoutSessionHistory = async () => {
    try {
      const records = await workoutService.getWorkouts();
      setWorkoutSessionHistory(records || []);
    } catch (error) {
      console.error('Failed to load workout session history:', error);
    }
  };

  const loadLocalRunHistory = async () => {
    try {
      const runs = await db.runHistory.orderBy('timestamp').reverse().limit(50).toArray();
      setLocalRunHistory(runs);
    } catch (error) {
      console.error('Failed to load local run history:', error);
    }
  };

  useEffect(() => {
    fetchWorkoutSessionHistory();
    loadLocalRunHistory();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setGpsAccuracyMeters(pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null);
          setGpsPermissionState('granted');
          setGpsErrorMsg(null);
        },
        (err) => {
          console.warn('Initial GPS query note:', err.message);
          setGpsPermissionState('denied');
          setGpsErrorMsg(err.message);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      setGpsPermissionState('denied');
      setGpsErrorMsg('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleRequestLocationAccess = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setGpsAccuracyMeters(pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null);
          setGpsPermissionState('granted');
          setGpsErrorMsg(null);
          setIsPermissionModalOpen(false);
        },
        (err) => {
          setGpsPermissionState('denied');
          setGpsErrorMsg(err.message);
          setIsPermissionModalOpen(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // Start workout session
  const beginWorkoutSession = async (useSimulation = false) => {
    setGpsCoordinatesPath([]);
    setSessionDistanceKm(0);
    setActiveDurationSeconds(0);
    setElapsedDurationSeconds(0);
    setCurrentSpeedKmh(0);
    setAverageSpeedKmh(0);
    setPeakSpeedKmh(0);
    setCurrentPaceMinKm(0);
    setAveragePaceMinKm(0);
    setEstimatedCaloriesBurned(0);
    setElevationGainMeters(0);
    setHeadingAngle(0);
    setCadenceSpm(0);
    setMotionStepCount(0);
    setActivityState('stationary');
    setIsSessionTracking(true);
    setIsSessionPaused(false);
    setIsAutoPausedState(false);
    setIsSimulatedMode(useSimulation);
    sessionStartTimeRef.current = new Date();

    voiceCoPilot.announceSessionStart(selectedActivityType);

    // Start motion sensors
    const motionPermission = await motionSensorManager.requestPermission();
    if (motionPermission) {
      motionSensorManager.resetSteps();
      motionSensorManager.start({
        onMotionUpdate: (state: MotionState) => {
          latestMotionRef.current = state;
          setCadenceSpm(state.cadenceSpm);
          setMotionStepCount(state.stepCount);
        },
        onStepDetected: (totalSteps: number) => {
          setMotionStepCount(totalSteps);
        },
      });
    }

    const trackerCallbacks = {
      onPoint: (point: GpsPoint, stats: GpsStats, allPoints: GpsPoint[]) => {
        setGpsPermissionState('granted');
        setGpsErrorMsg(null);
        setCurrentUserLocation([point.lat, point.lng]);
        setGpsAccuracyMeters(point.accuracy);
        setSessionDistanceKm(stats.distanceKm);
        setActiveDurationSeconds(stats.durationSeconds);
        setElapsedDurationSeconds(stats.elapsedDurationSeconds);
        setCurrentSpeedKmh(stats.currentSpeedKmh);
        setAverageSpeedKmh(stats.averageSpeedKmh);
        setPeakSpeedKmh(stats.peakSpeedKmh);
        setCurrentPaceMinKm(stats.currentPaceMinKm);
        setAveragePaceMinKm(stats.averagePaceMinKm);
        setEstimatedCaloriesBurned(stats.caloriesBurned);
        setElevationGainMeters(stats.elevationGainMeters);
        setHeadingAngle(stats.heading);
        if (stats.isAutoPaused !== undefined) setIsAutoPausedState(stats.isAutoPaused);

        const routeCoords: [number, number][] = allPoints.map((pt) => [pt.lat, pt.lng]);
        setGpsCoordinatesPath(routeCoords);

        // Sensor fusion
        const motion = latestMotionRef.current;
        if (motion) {
          const fusion = detectActivityState({
            gpsSpeedKmh: stats.currentSpeedKmh,
            gpsAccuracyMeters: stats.accuracyMeters,
            accelerationMagnitude: motion.accelerationMagnitude,
            isRhythmicMovement: motion.isRhythmicMovement,
            movementIntensity: motion.movementIntensity,
            cadenceSpm: motion.cadenceSpm,
          });
          setActivityState(fusion.activityState);
        }
      },
      onError: (err: any) => {
        console.warn('Live GPS watch error:', err.message);
        setGpsErrorMsg(err.message);
        if ('code' in err && err.code === 1) setGpsPermissionState('denied');
      },
      onWakeLockChange: (isActive: boolean) => setIsWakeLockActive(isActive),
      onAutoPauseChange: (isPaused: boolean) => setIsAutoPausedState(isPaused),
    };

    if (useSimulation) {
      await gpsTracker.startSimulatedTracking(selectedActivityType, 70, trackerCallbacks);
    } else {
      await gpsTracker.startTracking(selectedActivityType, 70, trackerCallbacks);
    }

    durationTimerRef.current = setInterval(() => {
      setActiveDurationSeconds(gpsTracker.getActiveDurationSeconds());
      setElapsedDurationSeconds(gpsTracker.getElapsedDurationSeconds());
    }, 1000);
  };

  const pauseWorkoutSession = () => {
    setIsSessionPaused(true);
    gpsTracker.pauseTracking();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    voiceCoPilot.announceSessionPause();
  };

  const resumeWorkoutSession = async () => {
    setIsSessionPaused(false);
    voiceCoPilot.announceSessionResume();
    await gpsTracker.resumeTracking();
    durationTimerRef.current = setInterval(() => {
      setActiveDurationSeconds(gpsTracker.getActiveDurationSeconds());
      setElapsedDurationSeconds(gpsTracker.getElapsedDurationSeconds());
    }, 1000);
  };

  const handleFinishPress = () => {
    setIsFinishConfirmOpen(true);
  };

  const terminateWorkoutSession = async () => {
    setIsFinishConfirmOpen(false);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);

    // Stop motion sensors
    motionSensorManager.stop();

    const summary = gpsTracker.stopTracking();
    const sessionEndTime = new Date();
    const avgPaceFormatted = formatPace(averagePaceMinKm);

    voiceCoPilot.announceSessionSummary(summary.distanceKm, formatElapsedDuration(summary.durationSeconds), summary.paceMinKm);

    // Save to local run history
    try {
      await db.runHistory.add({
        startTime: sessionStartTimeRef.current?.toISOString() || new Date().toISOString(),
        endTime: sessionEndTime.toISOString(),
        activeDuration: summary.durationSeconds,
        elapsedDuration: summary.elapsedDurationSeconds || summary.durationSeconds,
        distance: summary.distanceKm,
        averageSpeed: summary.averageSpeedKmh || 0,
        maximumSpeed: summary.peakSpeedKmh,
        averagePace: avgPaceFormatted,
        calories: summary.caloriesBurned,
        elevationGain: summary.elevationGainMeters || 0,
        cadence: cadenceSpm,
        routePoints: JSON.stringify(summary.points),
        activityType: selectedActivityType,
        synced: 0,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error('Failed to save run locally:', e);
    }

    // Save to backend
    try {
      await workoutService.logWorkout({
        type: selectedActivityType,
        startTime: sessionStartTimeRef.current?.toISOString() || new Date().toISOString(),
        endTime: sessionEndTime.toISOString(),
        distance: summary.distanceKm,
        duration: summary.durationSeconds,
        avgSpeed: summary.averageSpeedKmh || (summary.distanceKm > 0 ? (summary.distanceKm / (summary.durationSeconds / 3600)) : 0),
        maxSpeed: summary.peakSpeedKmh,
        caloriesBurned: summary.caloriesBurned,
        routeGeoJson: summary.routeGeoJson,
        averagePace: avgPaceFormatted,
        elevationGain: summary.elevationGainMeters || 0,
        cadence: cadenceSpm,
        activeDuration: summary.durationSeconds,
      });

      setSummaryModalData({
        type: selectedActivityType,
        activityType: selectedActivityType,
        distanceKm: summary.distanceKm,
        durationSeconds: summary.durationSeconds,
        avgSpeedKmh: summary.averageSpeedKmh || 0,
        maxSpeedKmh: summary.peakSpeedKmh,
        caloriesBurned: summary.caloriesBurned,
        avgPaceFormatted,
        routeCoords: summary.routeCoords,
        elevationGainMeters: summary.elevationGainMeters || 0,
        cadenceSpm,
      });
      setIsSummaryModalOpen(true);
      fetchWorkoutSessionHistory();
      loadLocalRunHistory();
    } catch (error) {
      console.error('Failed to log workout to backend:', error);
    } finally {
      setIsSessionTracking(false);
      setIsSessionPaused(false);
      setGpsCoordinatesPath([]);
      setSessionDistanceKm(0);
      setActiveDurationSeconds(0);
      setCurrentSpeedKmh(0);
      setPeakSpeedKmh(0);
    }
  };

  const toggleVoiceCoPilotMute = () => {
    const newMuted = !isVoiceCoPilotMuted;
    setIsVoiceCoPilotMuted(newMuted);
    voiceCoPilot.setMuted(newMuted);
  };

  const formatElapsedDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const targetProgressPercent = Math.min(100, Math.round((sessionDistanceKm / activeTargetDistanceKm) * 100));

  const activityBadgeColor = activityState === 'running'
    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
    : activityState === 'walking'
    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
    : 'bg-gray-500/20 border-gray-500/40 text-gray-400';

  const openRunDetail = (run: RunRecord) => {
    setSelectedRunDetail(run);
    setIsRunDetailOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-4 max-w-6xl mx-auto font-sans">
      {/* Modals */}
      <GpsTargetCalculatorModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onApplyTarget={(dist, pace) => {
          setActiveTargetDistanceKm(dist);
          setActiveTargetPaceMinKm(pace);
        }}
      />
      <WorkoutSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summaryData={summaryModalData}
      />
      <LocationPermissionModal
        isOpen={isPermissionModalOpen}
        permissionState={gpsPermissionState}
        errorMessage={gpsErrorMsg}
        onRequestAccess={handleRequestLocationAccess}
        onUseDemoRoute={() => beginWorkoutSession(true)}
        onClose={() => setIsPermissionModalOpen(false)}
      />
      <FinishConfirmationModal
        isOpen={isFinishConfirmOpen}
        onConfirm={terminateWorkoutSession}
        onCancel={() => setIsFinishConfirmOpen(false)}
        distanceKm={sessionDistanceKm}
        durationFormatted={formatElapsedDuration(activeDurationSeconds)}
        paceFormatted={formatPace(currentPaceMinKm)}
      />
      <RunDetailModal
        isOpen={isRunDetailOpen}
        onClose={() => setIsRunDetailOpen(false)}
        run={selectedRunDetail}
      />

      {/* Permission Warning */}
      {gpsPermissionState === 'denied' && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 font-mono space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
            <AlertCircle className="w-4 h-4" />
            <span>GPS Location Permission Blocked</span>
          </div>
          <div className="text-xs text-gray-300 font-sans">
            {gpsErrorMsg || 'Browser location access was denied.'} Please open your phone browser site settings, enable Location permissions for this domain, and tap Request Access below.
          </div>
          <button
            onClick={handleRequestLocationAccess}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow cursor-pointer mt-1"
          >
            Retry Location Access
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-brand-500" />
            <span>GPS RUN TRACKER & MOTION SENSOR FUSION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
            Live {currentProfile.name} Tracker
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Tooltip content="🎯 Configure Target Distance & Pace" position="bottom">
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target: {activeTargetDistanceKm} km</span>
            </button>
          </Tooltip>

          <Tooltip content="🔒 Screen wake during GPS runs" position="bottom">
            <div className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
              isWakeLockActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-glow'
                : 'bg-dark-bg border-dark-border/80 text-gray-400'
            }`}>
              {isWakeLockActive ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <LockOpen className="w-3.5 h-3.5" />}
              <span>{isWakeLockActive ? 'WakeLock' : 'Idle'}</span>
            </div>
          </Tooltip>

          <Tooltip content="🗣️ Voice announcements" position="bottom">
            <button
              onClick={toggleVoiceCoPilotMute}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isVoiceCoPilotMuted
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-brand-600/20 border-brand-500/40 text-brand-400 shadow-glow'
              }`}
            >
              {isVoiceCoPilotMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isVoiceCoPilotMuted ? 'Voice Off' : 'Voice ON'}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Map & Telemetry HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 relative">
          <GoogleMapView
            coords={gpsCoordinatesPath}
            userLocation={currentUserLocation}
            isLive={isSessionTracking}
            heading={headingAngle}
            height="280px"
            onLocateMe={handleRequestLocationAccess}
          />

          {/* Live HUD Overlay */}
          {isSessionTracking && (
            <div className="absolute top-14 left-2.5 right-2.5 sm:top-14 sm:left-4 sm:right-4 z-[5] flex items-center justify-between p-3 rounded-xl bg-dark-bg/90 backdrop-blur-md border border-brand-500/40 shadow-glow font-mono">
              <div className="flex items-center gap-2 text-xs text-gray-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-tracking-pulse" />
                <span className="font-bold text-white uppercase">{currentProfile.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${activityBadgeColor}`}>
                  {activityState.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs tabular-nums">
                <span className="text-cyan-400 font-bold">{formatPace(currentPaceMinKm)} /km</span>
                <span className="text-gray-500">•</span>
                <span className="text-white font-bold">{sessionDistanceKm} km</span>
              </div>
            </div>
          )}

          {/* Ghost Battle */}
          <GhostBattleOverlay
            currentDistanceKm={sessionDistanceKm}
            currentPaceMinKm={currentPaceMinKm > 0 ? currentPaceMinKm.toFixed(2) : '6.00'}
            isGhostActive={isGhostActive}
            onToggleGhost={() => setIsGhostActive(!isGhostActive)}
          />
        </div>

        {/* Telemetry Panel */}
        <div className="telemetry-card rounded-2xl p-4 sm:p-6 border border-dark-border/80 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Activity Type */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">
                {currentProfile.label}
              </span>
              {isSessionTracking && (
                <div className="flex items-center gap-1.5">
                  {isAutoPausedState ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold animate-pulse">
                      AUTO-PAUSED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold animate-pulse">
                      {isSimulatedMode ? 'DEMO ROUTE' : 'GPS ACTIVE'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Target Progress */}
            <div className="p-3.5 rounded-xl bg-cyan-600/10 border border-cyan-500/30 space-y-2 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" /> Goal ({activeTargetDistanceKm} km)
                </span>
                <span className="text-white font-extrabold tabular-nums">
                  {sessionDistanceKm} / {activeTargetDistanceKm} km ({targetProgressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-dark-bg border border-dark-border/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-teal-400 rounded-full transition-all duration-700 ease-out shadow-glow"
                  style={{ width: `${targetProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 font-mono">
              {!isSessionTracking ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 font-mono">
                  <button
                    onClick={() => beginWorkoutSession(false)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-white shrink-0" />
                    <span>Start Live GPS {currentProfile.name}</span>
                  </button>
                  <button
                    onClick={() => beginWorkoutSession(true)}
                    className="w-full py-2.5 px-3 bg-dark-bg hover:bg-brand-600/20 text-cyan-300 hover:text-white border border-cyan-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Demo Simulated Route</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {isSessionPaused ? (
                    <button
                      onClick={resumeWorkoutSession}
                      className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseWorkoutSession}
                      className="py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause</span>
                    </button>
                  )}
                  <button
                    onClick={handleFinishPress}
                    className="py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Finish</span>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border/80">
                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase font-mono mb-0.5">
                  <Navigation className="w-3 h-3 text-brand-400" />
                  <span>Distance</span>
                </div>
                <div className="text-xl font-bold text-white font-mono tabular-nums">{sessionDistanceKm}</div>
                <div className="text-[10px] text-gray-500 font-mono">km</div>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border/80">
                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase font-mono mb-0.5">
                  <Timer className="w-3 h-3 text-brand-400" />
                  <span>Time</span>
                </div>
                <div className="text-xl font-bold text-white font-mono tabular-nums">{formatElapsedDuration(activeDurationSeconds)}</div>
                <div className="text-[10px] text-gray-500 font-mono">active</div>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border/80">
                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase font-mono mb-0.5">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <span>Pace</span>
                </div>
                <div className="text-base font-bold text-cyan-400 font-mono tabular-nums">{formatPace(currentPaceMinKm)}</div>
                <div className="text-[10px] text-gray-500 font-mono">/km</div>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border/80">
                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase font-mono mb-0.5">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <span>Speed</span>
                </div>
                <div className="text-base font-bold text-cyan-300 font-mono tabular-nums">{currentSpeedKmh}</div>
                <div className="text-[10px] text-gray-500 font-mono">km/h</div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-dark-bg border border-dark-border/80">
                <div className="flex items-center justify-center gap-1 text-[9px] text-gray-500 uppercase font-mono mb-0.5">
                  <Footprints className="w-2.5 h-2.5 text-purple-400" />
                  <span>Cadence</span>
                </div>
                <div className="text-sm font-bold text-purple-400 font-mono tabular-nums">{cadenceSpm || '--'}</div>
                <div className="text-[9px] text-gray-600 font-mono">spm</div>
              </div>

              <div className="p-2 rounded-xl bg-dark-bg border border-dark-border/80">
                <div className="flex items-center justify-center gap-1 text-[9px] text-gray-500 uppercase font-mono mb-0.5">
                  <Mountain className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Elevation</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">+{elevationGainMeters}</div>
                <div className="text-[9px] text-gray-600 font-mono">m</div>
              </div>

              <div className="p-2 rounded-xl bg-dark-bg border border-dark-border/80">
                <div className="flex items-center justify-center gap-1 text-[9px] text-gray-500 uppercase font-mono mb-0.5">
                  <Flame className="w-2.5 h-2.5 text-amber-400" />
                  <span>Calories</span>
                </div>
                <div className="text-sm font-bold text-amber-400 font-mono tabular-nums">{estimatedCaloriesBurned}</div>
                <div className="text-[9px] text-gray-600 font-mono">kcal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Run History */}
      <div className="telemetry-card rounded-2xl p-6 border border-dark-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-display uppercase tracking-wide">
            <History className="w-4 h-4 text-brand-400" />
            <span>Run History</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">
            {localRunHistory.length} {localRunHistory.length === 1 ? 'run' : 'runs'} saved
          </span>
        </div>

        {localRunHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localRunHistory.map((run) => (
              <button
                key={run.id}
                onClick={() => openRunDetail(run)}
                className="p-4 rounded-xl bg-dark-bg border border-dark-border/80 flex items-center justify-between font-mono hover:border-brand-500/40 transition-all cursor-pointer group text-left w-full"
              >
                <div>
                  <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-brand-400" />
                    {run.activityType || 'running'}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(run.startTime).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-2">
                    {run.cadence > 0 && <span className="text-purple-400">{run.cadence} spm</span>}
                    {run.elevationGain > 0 && <span className="text-emerald-400">+{run.elevationGain}m</span>}
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-sm font-bold text-brand-400 tabular-nums">{run.distance} km</div>
                    <div className="text-[10px] text-gray-400 tabular-nums">
                      {formatElapsedDuration(run.activeDuration)}
                    </div>
                    <div className="text-[10px] text-cyan-400 tabular-nums">
                      {run.averagePace} /km
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-brand-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        ) : workoutSessionHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutSessionHistory.map((workout: any) => (
              <div
                key={workout.id}
                className="p-4 rounded-xl bg-dark-bg border border-dark-border/80 flex items-center justify-between font-mono"
              >
                <div>
                  <div className="text-xs font-bold text-white uppercase">{workout.type}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(workout.startTime).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-brand-400 tabular-nums">{workout.distance} km</div>
                  <div className="text-[10px] text-gray-400 tabular-nums">
                    {formatElapsedDuration(workout.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-dark-border/80 text-center font-mono text-xs text-gray-500">
            No runs logged yet. Start a session above to record your first run!
          </div>
        )}
      </div>
    </div>
  );
};
