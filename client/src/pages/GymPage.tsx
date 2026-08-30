import React, { useState } from 'react';
import {
  Dumbbell,
  Plus,
  Play,
  CheckCircle2,
  Timer,
  Search,
  ChevronRight,
  Flame,
  Trophy,
  Activity,
  Layers,
  RotateCcw,
  Trash2,
  Zap,
  Eye,
  Sparkles,
  Info,
} from 'lucide-react';
import { RestTimerModal } from '../components/telemetry/RestTimerModal';
import { ExerciseGuideModal, DetailedExerciseInfo } from '../components/telemetry/ExerciseGuideModal';
import { Tooltip } from '../components/common/Tooltip';

export interface ExerciseItem extends DetailedExerciseInfo {
  defaultSets: number;
  defaultReps: number;
}

export interface ExerciseSet {
  setNumber: number;
  weightLbs: number;
  reps: number;
  completed: boolean;
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  category: string;
  imageUrl?: string;
  sets: ExerciseSet[];
}

export interface GymRoutine {
  id: string;
  title: string;
  category: string;
  estimatedMins: number;
  exercises: {
    exerciseId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
  }[];
}

// Rich Exercise Database with HD Demonstration Graphics & Technique Guides
const EXERCISE_VAULT: ExerciseItem[] = [
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    category: 'Chest',
    equipment: 'Barbell',
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoid', 'Triceps Brachii'],
    defaultSets: 4,
    defaultReps: 10,
    tempo: '3-1-1',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Lie flat on the bench with eyes aligned directly underneath the barbell.',
      'Grip the bar slightly wider than shoulder-width and unrack with elbows tucked at a 45-degree angle.',
      'Lower the bar steadily to your mid-sternum, pause for 1 second, then explode upward to lock out.',
    ],
    proTip: 'Retract your scapula and arch your upper back to isolate the chest fibers and protect shoulder joints.',
  },
  {
    id: 'ex-2',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    equipment: 'Dumbbell',
    primaryMuscle: 'Upper Chest',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    defaultSets: 3,
    defaultReps: 12,
    tempo: '3-0-1',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Set an incline bench to 30 degrees and rest dumbbells on your thighs.',
      'Kick dumbbells up to shoulder level and press vertically upward above your upper chest.',
      'Control the descent until elbows pass 90 degrees, feeling a deep upper chest stretch.',
    ],
    proTip: 'Keep wrists stacked directly over your elbows throughout the entire arc of motion.',
  },
  {
    id: 'ex-3',
    name: 'Cable Chest Flyes',
    category: 'Chest',
    equipment: 'Cable',
    primaryMuscle: 'Inner Chest',
    secondaryMuscles: ['Front Delts'],
    defaultSets: 3,
    defaultReps: 15,
    tempo: '2-1-2',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Set dual cable pulleys at chest height and step forward into a staggered stance.',
      'Keep a slight bend in your elbows and sweep your hands together in front of your chest.',
      'Squeeze inner pectorals at peak contraction before slowly controlling the stretch return.',
    ],
    proTip: 'Imagine hugging a wide barrel to keep tension focused exclusively on pectoral fibers.',
  },
  {
    id: 'ex-4',
    name: 'Barbell Deadlift',
    category: 'Back',
    equipment: 'Barbell',
    primaryMuscle: 'Erector Spinae & Lats',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Traps'],
    defaultSets: 4,
    defaultReps: 6,
    tempo: '2-1-1',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand over the bar with feet hip-width apart and bar over mid-foot.',
      'Hinge hips back, grip the bar tightly, engage your lats, and pull chest tall.',
      'Drive feet into the floor to lift the bar straight up, extending hips and knees together.',
    ],
    proTip: 'Maintain a neutral spine throughout and drag the bar close along your shins.',
  },
  {
    id: 'ex-5',
    name: 'Lat Pulldown',
    category: 'Back',
    equipment: 'Cable',
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps Brachii', 'Rhomboids'],
    defaultSets: 4,
    defaultReps: 10,
    tempo: '3-1-1',
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Sit facing the lat pulldown machine and adjust thigh pads firmly.',
      'Grip the bar wide, lean back slightly (15 degrees), and pull elbows down toward your ribs.',
      'Touch the bar to your upper chest while driving shoulder blades together.',
    ],
    proTip: 'Initiate the movement by depressing your shoulder blades rather than pulling with biceps.',
  },
  {
    id: 'ex-6',
    name: 'Seated Cable Row',
    category: 'Back',
    equipment: 'Cable',
    primaryMuscle: 'Rhomboids & Mid-Back',
    secondaryMuscles: ['Lats', 'Rear Deltoids'],
    defaultSets: 3,
    defaultReps: 12,
    tempo: '2-1-2',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Sit on the row station with feet braced and knees slightly bent.',
      'Grip V-bar handle, sit upright with chest out, and row handle into your belly button.',
      'Squeeze middle back for 1 second, then control the stretch back forward.',
    ],
    proTip: 'Avoid excessive torso swinging; keep core tight to isolate mid-back muscle density.',
  },
  {
    id: 'ex-7',
    name: 'Barbell Back Squat',
    category: 'Legs',
    equipment: 'Barbell',
    primaryMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Hamstrings', 'Core'],
    defaultSets: 4,
    defaultReps: 8,
    tempo: '3-1-1',
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Position bar across your upper traps, step back, and set feet shoulder-width apart.',
      'Brace core, sit hips down and back while knees track in line with toes.',
      'Lower until thighs reach parallel with the floor, then drive through heels to stand.',
    ],
    proTip: 'Keep your chest elevated and maintain abdominal pressure to protect lower spine.',
  },
  {
    id: 'ex-8',
    name: 'Romanian Deadlift',
    category: 'Legs',
    equipment: 'Barbell',
    primaryMuscle: 'Hamstrings & Glutes',
    secondaryMuscles: ['Erector Spinae'],
    defaultSets: 4,
    defaultReps: 10,
    tempo: '3-1-1',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Hold barbell at hip height with an overhand grip and soft knee bend.',
      'Push hips back while lowering bar along your thighs until a deep hamstring stretch is felt.',
      'Drive hips forward to return to standing position.',
    ],
    proTip: 'Do not bend knees into a squat; movement is an eccentric hip hinge.',
  },
  {
    id: 'ex-9',
    name: 'Leg Press',
    category: 'Legs',
    equipment: 'Machine',
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes'],
    defaultSets: 4,
    defaultReps: 12,
    tempo: '3-0-1',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Place feet shoulder-width apart on the sled platform.',
      'Release safety handles and bend knees to 90 degrees to lower weight platform.',
      'Press sled back up forcibly without locking knees at top.',
    ],
    proTip: 'Never lock out knees completely at top to keep tension on quads and protect joints.',
  },
  {
    id: 'ex-10',
    name: 'Overhead Barbell Press',
    category: 'Shoulders',
    equipment: 'Barbell',
    primaryMuscle: 'Anterior Deltoid',
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    defaultSets: 4,
    defaultReps: 8,
    tempo: '2-1-1',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Rest barbell across collarbone with grip just outside shoulders.',
      'Brace glutes and core, then press bar straight overhead past your chin.',
      'Lock out bar directly over your crown before lowering under control.',
    ],
    proTip: 'Squeeze glutes tight to prevent leaning backward during heavy overhead drives.',
  },
  {
    id: 'ex-11',
    name: 'Dumbbell Lateral Raise',
    category: 'Shoulders',
    equipment: 'Dumbbell',
    primaryMuscle: 'Lateral Deltoid',
    secondaryMuscles: ['Traps'],
    defaultSets: 4,
    defaultReps: 15,
    tempo: '2-1-2',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand holding dumbbells at your sides with palms facing inward.',
      'Raise arms outward to the sides until parallel with floor, pinkies slightly elevated.',
      'Pause at top contraction, then lower slowly back to hips.',
    ],
    proTip: 'Lead with your elbows rather than hands to isolate lateral deltoid heads.',
  },
  {
    id: 'ex-12',
    name: 'Face Pulls',
    category: 'Shoulders',
    equipment: 'Cable',
    primaryMuscle: 'Rear Deltoids',
    secondaryMuscles: ['External Rotators', 'Traps'],
    defaultSets: 3,
    defaultReps: 15,
    tempo: '2-1-2',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Attach rope to upper cable pulley and hold handles with thumbs pointing backward.',
      'Pull rope toward forehead while separating hands and rotating shoulders outward.',
      'Hold rear delt squeeze for 1 second, then return forward slowly.',
    ],
    proTip: 'Essential exercise for posture balance and shoulder joint longevity.',
  },
  {
    id: 'ex-13',
    name: 'Barbell Bicep Curl',
    category: 'Arms',
    equipment: 'Barbell',
    primaryMuscle: 'Biceps Brachii',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    defaultSets: 3,
    defaultReps: 12,
    tempo: '2-1-2',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand shoulder-width apart holding barbell with underhand shoulder-width grip.',
      'Keep elbows pinned to your sides and curl bar upward toward shoulders.',
      'Squeeze biceps at top, then lower bar through full range of motion.',
    ],
    proTip: 'Avoid swinging torso; keep elbows locked in fixed position.',
  },
  {
    id: 'ex-14',
    name: 'Tricep Rope Pushdown',
    category: 'Arms',
    equipment: 'Cable',
    primaryMuscle: 'Triceps Brachii',
    secondaryMuscles: ['Forearms'],
    defaultSets: 3,
    defaultReps: 12,
    tempo: '2-1-2',
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Attach rope to high pulley, hold ends with knuckles together.',
      'Push rope down until arms lock out, spreading rope handles apart at bottom.',
      'Return rope slowly up to chest height while keeping upper arms still.',
    ],
    proTip: 'Spread rope ends out at bottom lockout for maximum lateral tricep contraction.',
  },
];

// Preset Saved Routines
const PRESET_ROUTINES: GymRoutine[] = [
  {
    id: 'rout-push',
    title: 'Hypertrophy Push Power',
    category: 'Chest, Shoulders & Triceps',
    estimatedMins: 55,
    exercises: [
      { exerciseId: 'ex-1', name: 'Barbell Bench Press', targetSets: 4, targetReps: 8, targetWeight: 185 },
      { exerciseId: 'ex-2', name: 'Incline Dumbbell Press', targetSets: 3, targetReps: 10, targetWeight: 65 },
      { exerciseId: 'ex-10', name: 'Overhead Barbell Press', targetSets: 3, targetReps: 8, targetWeight: 115 },
      { exerciseId: 'ex-11', name: 'Dumbbell Lateral Raise', targetSets: 4, targetReps: 15, targetWeight: 25 },
      { exerciseId: 'ex-14', name: 'Tricep Rope Pushdown', targetSets: 3, targetReps: 12, targetWeight: 50 },
    ],
  },
  {
    id: 'rout-pull',
    title: 'Back & Bicep Density',
    category: 'Back, Rear Delts & Biceps',
    estimatedMins: 50,
    exercises: [
      { exerciseId: 'ex-4', name: 'Barbell Deadlift', targetSets: 4, targetReps: 6, targetWeight: 275 },
      { exerciseId: 'ex-5', name: 'Lat Pulldown', targetSets: 4, targetReps: 10, targetWeight: 140 },
      { exerciseId: 'ex-6', name: 'Seated Cable Row', targetSets: 3, targetReps: 12, targetWeight: 130 },
      { exerciseId: 'ex-12', name: 'Face Pulls', targetSets: 3, targetReps: 15, targetWeight: 45 },
      { exerciseId: 'ex-13', name: 'Barbell Bicep Curl', targetSets: 3, targetReps: 12, targetWeight: 75 },
    ],
  },
  {
    id: 'rout-legs',
    title: 'Leg Quad & Hamstring Focus',
    category: 'Quads, Hamstrings & Calves',
    estimatedMins: 60,
    exercises: [
      { exerciseId: 'ex-7', name: 'Barbell Back Squat', targetSets: 4, targetReps: 8, targetWeight: 225 },
      { exerciseId: 'ex-8', name: 'Romanian Deadlift', targetSets: 4, targetReps: 10, targetWeight: 185 },
      { exerciseId: 'ex-9', name: 'Leg Press', targetSets: 4, targetReps: 12, targetWeight: 360 },
    ],
  },
];

export const GymPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routines' | 'active_session' | 'vault'>('routines');
  const [routines, setRoutines] = useState<GymRoutine[]>(PRESET_ROUTINES);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Rest Timer state (anchored at top)
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(60);

  // Exercise Guide Modal state
  const [selectedGuideExercise, setSelectedGuideExercise] = useState<DetailedExerciseInfo | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Active Gym Session state
  const [activeRoutine, setActiveRoutine] = useState<GymRoutine | null>(null);
  const [sessionExercises, setSessionExercises] = useState<RoutineExercise[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(14);
  const [totalVolumeLbs, setTotalVolumeLbs] = useState(148500);

  // Custom routine builder modal/state
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineCategory, setNewRoutineCategory] = useState('Full Body');
  const [selectedExercisesForNewRoutine, setSelectedExercisesForNewRoutine] = useState<ExerciseItem[]>([]);

  const handleOpenExerciseGuide = (exItem: ExerciseItem | string) => {
    let targetEx: ExerciseItem | undefined;
    if (typeof exItem === 'string') {
      targetEx = EXERCISE_VAULT.find((ex) => ex.id === exItem || ex.name === exItem);
    } else {
      targetEx = exItem;
    }
    if (targetEx) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSelectedGuideExercise(targetEx);
      setIsGuideModalOpen(true);
    }
  };

  // Start a routine session
  const handleStartRoutine = (routine: GymRoutine) => {
    setActiveRoutine(routine);
    const exercisesFormatted: RoutineExercise[] = routine.exercises.map((ex) => {
      const match = EXERCISE_VAULT.find((v) => v.id === ex.exerciseId || v.name === ex.name);
      return {
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: match?.category || 'General',
        imageUrl: match?.imageUrl,
        sets: Array.from({ length: ex.targetSets }).map((_, idx) => ({
          setNumber: idx + 1,
          weightLbs: ex.targetWeight,
          reps: ex.targetReps,
          completed: false,
        })),
      };
    });
    setSessionExercises(exercisesFormatted);
    setSessionStartTime(Date.now());
    setActiveTab('active_session');
  };

  const handleToggleSetCompletion = (exIndex: number, setIndex: number) => {
    const updated = [...sessionExercises];
    const targetSet = updated[exIndex].sets[setIndex];
    targetSet.completed = !targetSet.completed;

    setSessionExercises(updated);

    // If set completed, prompt rest timer anchored at top!
    if (targetSet.completed) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setRestTimerSeconds(60);
      setIsRestTimerOpen(true);
    }
  };

  const handleUpdateSetData = (
    exIndex: number,
    setIndex: number,
    field: 'weightLbs' | 'reps',
    val: number
  ) => {
    const updated = [...sessionExercises];
    updated[exIndex].sets[setIndex][field] = val;
    setSessionExercises(updated);
  };

  const handleAddSetToExercise = (exIndex: number) => {
    const updated = [...sessionExercises];
    const currentSets = updated[exIndex].sets;
    const lastSet = currentSets[currentSets.length - 1];
    currentSets.push({
      setNumber: currentSets.length + 1,
      weightLbs: lastSet ? lastSet.weightLbs : 100,
      reps: lastSet ? lastSet.reps : 10,
      completed: false,
    });
    setSessionExercises(updated);
  };

  const handleFinishWorkoutSession = () => {
    let sessionVolume = 0;
    sessionExercises.forEach((ex) => {
      ex.sets.forEach((st) => {
        if (st.completed) {
          sessionVolume += st.weightLbs * st.reps;
        }
      });
    });

    setTotalVolumeLbs((prev) => prev + sessionVolume);
    setCompletedSessionsCount((prev) => prev + 1);
    setActiveRoutine(null);
    setSessionExercises([]);
    setSessionStartTime(null);
    setActiveTab('routines');
  };

  const handleCreateNewRoutine = () => {
    if (!newRoutineTitle.trim() || selectedExercisesForNewRoutine.length === 0) return;

    const created: GymRoutine = {
      id: `rout-${Date.now()}`,
      title: newRoutineTitle,
      category: newRoutineCategory,
      estimatedMins: selectedExercisesForNewRoutine.length * 12,
      exercises: selectedExercisesForNewRoutine.map((ex) => ({
        exerciseId: ex.id,
        name: ex.name,
        targetSets: ex.defaultSets,
        targetReps: ex.defaultReps,
        targetWeight: 100,
      })),
    };

    setRoutines([created, ...routines]);
    setIsCreatingRoutine(false);
    setNewRoutineTitle('');
    setSelectedExercisesForNewRoutine([]);
  };

  const toggleSelectExerciseForNewRoutine = (ex: ExerciseItem) => {
    if (selectedExercisesForNewRoutine.some((item) => item.id === ex.id)) {
      setSelectedExercisesForNewRoutine(
        selectedExercisesForNewRoutine.filter((item) => item.id !== ex.id)
      );
    } else {
      setSelectedExercisesForNewRoutine([...selectedExercisesForNewRoutine, ex]);
    }
  };

  // Filter exercise vault
  const filteredVault = EXERCISE_VAULT.filter((ex) => {
    const matchesCategory = selectedMuscle === 'All' || ex.category === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16 lg:pb-4 font-sans max-w-6xl mx-auto">
      {/* Top Rest Timer Modal */}
      <RestTimerModal
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        defaultSeconds={restTimerSeconds}
      />

      {/* Detailed Exercise Visual Technique Guide Modal */}
      <ExerciseGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        exercise={selectedGuideExercise}
      />

      {/* Page Title & Stats Overview Banner */}
      <div className="telemetry-card rounded-2xl p-6 relative overflow-hidden border border-brand-500/30 shadow-glow">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-brand-400 font-bold">
              <Dumbbell className="w-4 h-4 text-brand-500" />
              <span>HYPERTROPHY & MOTION ENGINE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Gym Routine Builder & <span className="text-brand-400">Exercise Vault</span>
            </h1>

            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              Explore 14+ visual exercise guides with high-res photos, build custom routines, track set volumes, and trigger top rest countdowns.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Tooltip content="Completed Gym Sessions Total" position="top">
              <div className="p-3 rounded-xl bg-dark-surface border border-dark-border text-center font-mono cursor-pointer">
                <div className="text-[10px] text-gray-400 uppercase">Sessions</div>
                <div className="text-lg font-bold text-white tabular-nums">🏋️ {completedSessionsCount}</div>
              </div>
            </Tooltip>

            <Tooltip content="Cumulative Overload Volume Logged in lbs" position="top">
              <div className="p-3 rounded-xl bg-dark-surface border border-dark-border text-center font-mono cursor-pointer">
                <div className="text-[10px] text-gray-400 uppercase">Volume Logged</div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">
                  {(totalVolumeLbs / 1000).toFixed(1)}k <span className="text-[10px] font-normal text-gray-400 font-sans">lbs</span>
                </div>
              </div>
            </Tooltip>

            {/* TOP REST TIMER BUTTON */}
            <Tooltip content="⏳ Open Rest Countdown Clock modal" position="left">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsRestTimerOpen(true);
                }}
                className="px-4 py-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/40 transition-all cursor-pointer flex flex-col items-center justify-center font-mono text-[10px] shadow-glow"
              >
                <Timer className="w-5 h-5 text-amber-400 mb-0.5 animate-pulse" />
                <span className="font-bold">Rest Timer</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-dark-surface border border-dark-border font-mono text-xs overflow-x-auto">
        <Tooltip content="Browse & Create Workout Templates" position="top">
          <button
            onClick={() => setActiveTab('routines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'routines'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Workout Routines ({routines.length})</span>
          </button>
        </Tooltip>

        <Tooltip content="Explore 14+ Visual Movement Guides" position="top">
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vault'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Exercise Vault ({EXERCISE_VAULT.length})</span>
          </button>
        </Tooltip>

        <Tooltip content="View Live Workout Log Session" position="top" className="ml-auto">
          <button
            onClick={() => {
              if (!activeRoutine && routines.length > 0) {
                handleStartRoutine(routines[0]);
              } else {
                setActiveTab('active_session');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'active_session'
                ? 'bg-emerald-600 text-white shadow-glow'
                : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{activeRoutine ? `Active: ${activeRoutine.title}` : 'Quick Start Gym Session'}</span>
          </button>
        </Tooltip>
      </div>

      {/* SECTION 1: ROUTINES TAB */}
      {activeTab === 'routines' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white font-display">Saved Workout Templates</h2>
              <p className="text-xs text-gray-400">Launch a preset routine or build your own custom split.</p>
            </div>

            <button
              onClick={() => setIsCreatingRoutine(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-glow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Routine</span>
            </button>
          </div>

          {/* Routine Creation Modal */}
          {isCreatingRoutine && (
            <div className="telemetry-card rounded-2xl p-6 space-y-4 border border-brand-500/50 shadow-glow animate-slide-up">
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-400" /> Build Custom Workout Routine
                </h3>
                <button
                  onClick={() => setIsCreatingRoutine(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Routine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Arms & Core Blast"
                    value={newRoutineTitle}
                    onChange={(e) => setNewRoutineTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Split Category</label>
                  <select
                    value={newRoutineCategory}
                    onChange={(e) => setNewRoutineCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="Upper Body">Upper Body</option>
                    <option value="Lower Body">Lower Body</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Push">Push Split</option>
                    <option value="Pull">Pull Split</option>
                    <option value="Legs">Legs Split</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-mono">
                  Select Exercises ({selectedExercisesForNewRoutine.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {EXERCISE_VAULT.map((ex) => {
                    const isSelected = selectedExercisesForNewRoutine.some((item) => item.id === ex.id);
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => toggleSelectExerciseForNewRoutine(ex)}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600/30 border-brand-500 text-white font-bold'
                            : 'bg-dark-bg border-dark-border text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className="font-semibold truncate">{ex.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{ex.category}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleCreateNewRoutine}
                disabled={!newRoutineTitle.trim() || selectedExercisesForNewRoutine.length === 0}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-glow transition-all cursor-pointer"
              >
                Save Custom Routine
              </button>
            </div>
          )}

          {/* Routine Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="telemetry-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-brand-500/50 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 text-[10px] font-mono font-bold uppercase">
                      {routine.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                      <Timer className="w-3 h-3 text-amber-400" /> ~{routine.estimatedMins} mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-display group-hover:text-brand-300 transition-colors">
                    {routine.title}
                  </h3>

                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-mono text-gray-400 font-bold uppercase">
                      Movements & Visual Guides ({routine.exercises.length}):
                    </div>
                    <div className="space-y-1.5">
                      {routine.exercises.map((ex, i) => {
                        const match = EXERCISE_VAULT.find((v) => v.id === ex.exerciseId || v.name === ex.name);
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl bg-dark-bg/80 border border-dark-border/80 text-xs font-mono group/ex"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {match?.imageUrl && (
                                <img
                                  src={match.imageUrl}
                                  alt={ex.name}
                                  className="w-7 h-7 rounded-lg object-cover shrink-0 border border-dark-border"
                                />
                              )}
                              <span className="text-gray-200 truncate">{ex.name}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className="text-brand-400 text-[11px]">
                                {ex.targetSets}×{ex.targetReps}
                              </span>
                              <button
                                onClick={() => handleOpenExerciseGuide(ex.name)}
                                className="p-1 rounded bg-dark-surface hover:bg-brand-600/20 text-gray-400 hover:text-brand-300 transition-colors cursor-pointer"
                                title="View Visual Technique Guide"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartRoutine(routine)}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow transition-all cursor-pointer active:scale-95 mt-2"
                >
                  <Play className="w-4 h-4 fill-current text-cyan-300" />
                  <span>Start Workout Session</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: EXERCISE VAULT TAB */}
      {activeTab === 'vault' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search & Muscle Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search exercise or muscle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                    selectedMuscle === m
                      ? 'bg-brand-600 text-white shadow-glow'
                      : 'bg-dark-surface text-gray-400 hover:text-white border border-dark-border'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Rich Exercise Grid with Demonstration Pictures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredVault.map((ex) => (
              <div
                key={ex.id}
                className="telemetry-card rounded-2xl overflow-hidden flex flex-col justify-between hover:border-brand-500/50 transition-all group"
              >
                {/* Movement Image Banner */}
                <div className="relative h-40 overflow-hidden bg-dark-bg border-b border-dark-border">
                  <img
                    src={ex.imageUrl}
                    alt={ex.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-70" />

                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-dark-bg/80 backdrop-blur-md text-brand-400 text-[10px] font-mono font-bold border border-dark-border">
                      {ex.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-dark-bg/80 backdrop-blur-md text-gray-300 text-[10px] font-mono border border-dark-border">
                      {ex.equipment}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white font-display group-hover:text-brand-300 transition-colors">
                      {ex.name}
                    </h4>

                    <div className="text-xs text-gray-400 font-mono">
                      Target: <span className="text-gray-200 font-semibold">{ex.primaryMuscle}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dark-border/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Default: {ex.defaultSets} × {ex.defaultReps}</span>

                    <button
                      onClick={() => handleOpenExerciseGuide(ex)}
                      className="px-3 py-1 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 transition-all cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Watch Guide</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: ACTIVE GYM SESSION TAB */}
      {activeTab === 'active_session' && (
        <div className="space-y-6 animate-fade-in">
          {!activeRoutine ? (
            <div className="telemetry-card rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
              <Dumbbell className="w-12 h-12 text-brand-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white font-display">No Active Gym Session</h3>
              <p className="text-xs text-gray-400">
                Select a workout routine from the templates or launch a quick custom session.
              </p>
              <button
                onClick={() => setActiveTab('routines')}
                className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-glow cursor-pointer"
              >
                Choose Workout Template
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Session Header HUD */}
              <div className="telemetry-card rounded-2xl p-5 border border-emerald-500/40 shadow-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>LIVE GYM SESSION IN PROGRESS</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white font-display">{activeRoutine.title}</h2>
                  <p className="text-xs text-gray-400 font-mono">
                    {sessionExercises.length} movements • Log weight & check off completed sets
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* TOP REST TIMER BUTTON IN ACTIVE SESSION */}
                  <button
                    onClick={() => setIsRestTimerOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-glow"
                  >
                    <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Rest Timer (Top)</span>
                  </button>

                  <button
                    onClick={handleFinishWorkoutSession}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-glow cursor-pointer transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish Workout</span>
                  </button>
                </div>
              </div>

              {/* Active Exercises Set Tracker */}
              <div className="space-y-4">
                {sessionExercises.map((ex, exIdx) => (
                  <div key={exIdx} className="telemetry-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-dark-border pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-brand-600/30 text-brand-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {exIdx + 1}
                        </span>
                        {ex.imageUrl && (
                          <img
                            src={ex.imageUrl}
                            alt={ex.name}
                            className="w-10 h-10 rounded-xl object-cover border border-dark-border"
                          />
                        )}
                        <div>
                          <h3 className="text-base font-bold text-white font-display">{ex.name}</h3>
                          <span className="text-[10px] text-brand-400 font-mono">{ex.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenExerciseGuide(ex.name)}
                          className="px-3 py-1.5 rounded-xl bg-dark-surface hover:bg-brand-600/20 text-gray-300 hover:text-brand-300 border border-dark-border font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Form Guide</span>
                        </button>

                        <button
                          onClick={() => handleAddSetToExercise(exIdx)}
                          className="text-xs text-brand-400 hover:text-brand-300 font-mono flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Set
                        </button>
                      </div>
                    </div>

                    {/* Sets Header Table */}
                    <div className="space-y-2 font-mono text-xs">
                      <div className="grid grid-cols-12 gap-2 text-gray-500 font-bold uppercase text-[10px] px-2">
                        <div className="col-span-2">SET</div>
                        <div className="col-span-4">LBS (WEIGHT)</div>
                        <div className="col-span-4">REPS</div>
                        <div className="col-span-2 text-right">DONE</div>
                      </div>

                      {ex.sets.map((st, stIdx) => (
                        <div
                          key={stIdx}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                            st.completed
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 shadow-glow'
                              : 'bg-dark-bg border-dark-border text-white'
                          }`}
                        >
                          <div className="col-span-2 font-bold text-gray-400">Set {st.setNumber}</div>

                          <div className="col-span-4 flex items-center gap-1">
                            <input
                              type="number"
                              value={st.weightLbs}
                              onChange={(e) =>
                                handleUpdateSetData(exIdx, stIdx, 'weightLbs', Number(e.target.value))
                              }
                              className="w-full px-2.5 py-1 rounded-lg bg-dark-surface border border-dark-border text-white text-xs font-mono font-bold focus:border-brand-500 outline-none"
                            />
                            <span className="text-[10px] text-gray-500">lbs</span>
                          </div>

                          <div className="col-span-4 flex items-center gap-1">
                            <input
                              type="number"
                              value={st.reps}
                              onChange={(e) =>
                                handleUpdateSetData(exIdx, stIdx, 'reps', Number(e.target.value))
                              }
                              className="w-full px-2.5 py-1 rounded-lg bg-dark-surface border border-dark-border text-white text-xs font-mono font-bold focus:border-brand-500 outline-none"
                            />
                            <span className="text-[10px] text-gray-500">reps</span>
                          </div>

                          <div className="col-span-2 text-right">
                            <button
                              onClick={() => handleToggleSetCompletion(exIdx, stIdx)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                st.completed
                                  ? 'bg-emerald-500 text-white shadow-glow'
                                  : 'bg-dark-surface text-gray-500 hover:text-white border border-dark-border'
                              }`}
                              title={st.completed ? 'Completed (Top Rest Timer Triggered)' : 'Mark Set Completed'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GymPage;
