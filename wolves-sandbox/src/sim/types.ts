import type {MapConfig, Point} from '../config/map';

export const ACTIONS = ['ATTACK_THREAT', 'IDLE', 'WANDER', 'GO_TO', 'DRINK', 'EAT', 'HUNT', 'REST', 'FLEE', 'FOLLOW', 'PLAY', 'SHARE_FOOD', 'GROOM', 'HOWL', 'QUARREL', 'PROVOKE', 'ALLY', 'CHALLENGE', 'SUBMIT'] as const;
export type Action = typeof ACTIONS[number];
export type BrainKind = 'utility' | 'llm' | 'hybrid';

export interface Needs {
    hunger: number;
    thirst: number;
    energy: number;
    safety: number
}

export interface Traits {
    boldness: number;
    sociability: number;
    patience: number;
    aggression: number
}

export interface Emotions {
    joy: number;
    fear: number;
    anger: number;
    sadness: number;
    curiosity: number
}

export interface Relationship {
    trust: number;
    affection: number
}

export interface Memory {
    type: string;
    x: number;
    y: number;
    time: number;
    valence: number;
    involvedIds: string[];
    strength: number
}

export interface Thought {
    time: number;
    text: string
}

export interface Decision {
    action: Action;
    targetId?: string;
    thought: string;
    emotionNudges?: Partial<Emotions>;
    plan?: StrategicPlan
}

export interface StrategicPlan {
    goal: string;
    steps: string[];
    success: string;
    abort: string;
    createdAt: number
}

export interface Conflict {
    id: string;
    firstId: string;
    secondId: string;
    createdAt: number;
    deadline: number;
    status: 'pending' | 'engaged' | 'resolved' | 'blocked';
    reason?: string
}

export interface DecisionRecord {
    time: number;
    wolfId: string;
    action: Action;
    targetId?: string;
    thought: string;
    previousAction: Action;
    previousTargetId?: string;
    goal: string;
    preconditionsMet: boolean;
    state: {
        health: number;
        maxHealth: number;
        attack: number;
        energy: number;
        hunger: number;
        emotions: Emotions;
        targetHealth?: number;
        targetAttack?: number;
        targetTrust?: number;
        targetAffection?: number
    };
    plan?: StrategicPlan;
    startedAt?: number;
    finishedAt?: number;
    result?: 'success' | 'failure' | 'abandoned';
    resultReason?: string;
    emotionTrigger?: string
}

export interface Wolf extends Point {
    id: string;
    name: string;
    brain: BrainKind;
    design: 'blue' | 'pink';
    traits: Traits;
    persona: string;
    attack: number;
    maxHealth: number;
    health: number;
    needs: Needs;
    emotions: Emotions;
    relationships: Record<string, Relationship>;
    memories: Memory[];
    known: { food: Point[]; water: Point[]; danger: Point[]; den: Point };
    decision: Decision;
    decisionAt: number;
    commitmentUntil: number;
    socialCooldownUntil: number;
    provokeCooldownUntil: number;
    challengeCooldownUntil: number;
    submittedTo?: string;
    dominanceWins: number;
    dominanceLosses: number;
    path: Point[];
    speed: number;
    foodHeld: number;
    thoughts: Thought[];
    combatCooldownUntil: number;
    allianceWith?: string;
    allianceTargetId?: string;
    allianceExpiresAt?: number;
    lastEmotionTrigger?: string;
    stats: WolfStats
}

export interface WolfStats {
    timeByAction: Record<Action, number>;
    needTotal: number;
    emotionTotal: Emotions;
    trajectory: { time: number; needs: Needs; emotions: Emotions; action: Action }[];
    samples: number;
    interactions: number;
    decisions: number;
    llmCalls: number;
    llmLatencyMs: number;
    llmFailures: number;
    invalidReplies: number;
    preyKills: number;
    threatKills: number;
    attackGained: number;
    maxHealthGained: number;
    decisionChanges: number;
    abandonedPlans: number;
    strategicActions: number;
    successfulStrategicActions: number;
    failedStrategicActions: number;
    actionStartCount: number;
    actionStartDelayTotal: number;
    protectionSuccesses: number;
    protectionFailures: number;
    foodGiven: number;
    foodReceived: number
}

export interface Prey extends Point {
    id: string;
    state: 'IDLE' | 'GRAZE' | 'FLEE';
    energy: number
}

export interface Threat extends Point {
    health: number;
    maxHealth: number;
    attack: number;
    id: string;
    ttl: number
}

export interface Event {
    time: number;
    text: string;
    wolfId?: string
}

export interface World {
    time: number;
    seed: number;
    map: MapConfig;
    wolves: Wolf[];
    prey: Prey[];
    threats: Threat[];
    events: Event[];
    conflicts: Conflict[];
    decisionLog: DecisionRecord[];
    alphaId?: string;
    revision: number
}

export interface Observation {
    time: number;
    self: Wolf;
    wolves: Wolf[];
    prey: Prey[];
    threats: Threat[];
    map: MapConfig
}

export interface Brain {
    decide(observation: Observation, dtSeconds: number): Decision
}
