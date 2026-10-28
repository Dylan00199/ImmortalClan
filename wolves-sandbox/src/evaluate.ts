import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import {validateMap} from './config/map';
import {Engine} from './sim/world';
import type {Action, Wolf} from './sim/types';

const args = process.argv.slice(2);
const numberArg = (name: string, fallback: number) => {
    const index = args.indexOf(name);
    return index < 0 ? fallback : Number(args[index + 1]);
};
const seedCount = numberArg('--seeds', 30);
const hours = numberArg('--hours', .5);
const firstSeed = numberArg('--first-seed', 1);
if (!Number.isInteger(seedCount) || seedCount < 1 || seedCount > 1000 || !Number.isFinite(hours) || hours <= 0 || hours > 48 || !Number.isInteger(firstSeed)) {
    throw new Error('Usage: pnpm evaluate -- --seeds 30 --hours 0.5 --first-seed 1');
}

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const map = validateMap(JSON.parse(readFileSync(resolve(root, 'public/wolf-map/map.config.json'), 'utf8')));
const steps = Math.round(hours * 3600 / .1);
const emotionNames = ['joy', 'fear', 'anger', 'sadness', 'curiosity'] as const;
type WolfRun = {
    id: string;
    name: string;
    brain: string;
    decisions: number;
    strategicDecisions: number;
    started: number;
    startRate: number;
    meanStartDelaySeconds: number;
    decisionChanges: number;
    abandonedPlans: number;
    changesPerSimHour: number;
    feasibleRate: number;
    successfulStrategicActions: number;
    failedStrategicActions: number;
    strategicSuccessRate: number;
    emotionActionCounts: Record<string, number>;
    emotionActionMatchRate: number;
    emotionActionSamples: number;
    meanEmotions: Wolf['emotions'];
    threatKills: number;
    preyKills: number;
    attackGained: number;
    maxHealthGained: number;
    foodGiven: number;
    foodReceived: number;
    protectionSuccesses: number;
    protectionFailures: number;
    finalHealth: number;
    finalAttack: number;
    finalMaxHealth: number;
    alphaAtEnd: boolean;
    dominanceWins: number;
    dominanceLosses: number;
    llmCalls: number;
    llmFailures: number;
};
type Run = {seed: number; seconds: number; alphaId?: string; conflicts: {pending: number; engaged: number; resolved: number; blocked: number}; events: {provocations: number; duels: number}; wolves: WolfRun[]};

const strategic = new Set<Action>(['HUNT', 'CHALLENGE', 'ATTACK_THREAT', 'PROVOKE', 'ALLY', 'SHARE_FOOD']);
const expectedEmotionActions: Record<string, string[]> = {
    fear: ['FLEE', 'REST', 'ATTACK_THREAT'],
    anger: ['CHALLENGE', 'QUARREL', 'PROVOKE'],
    joy: ['PLAY', 'GROOM', 'SHARE_FOOD', 'HOWL'],
};
const runs: Run[] = [];

for (let index = 0; index < seedCount; index++) {
    const seed = firstSeed + index;
    const engine = new Engine(map, seed);
    // A single, repeatable threat probe per run ensures combat/protection behaviors are observed.
    const threatWolf = engine.world.wolves[index % engine.world.wolves.length];
    engine.spawnThreat(threatWolf.id);
    for (let i = 0; i < steps; i++) engine.step(.1);

    const wolves = engine.world.wolves.map(wolf => {
        const records = engine.world.decisionLog.filter(record => record.wolfId === wolf.id);
        const strategicRecords = records.filter(record => strategic.has(record.action));
        const startedRecords = strategicRecords.filter(record => record.startedAt !== undefined);
        const feasible = strategicRecords.filter(record => record.preconditionsMet);
        const emotionActionCounts: Record<string, number> = {};
        let emotionMatches = 0;
        let emotionSamples = 0;
        for (const record of records) {
            const topEmotion = emotionNames.reduce((best, key) => record.state.emotions[key] > record.state.emotions[best] ? key : best, emotionNames[0]);
            if (record.state.emotions[topEmotion] < .35 || !expectedEmotionActions[topEmotion]) continue;
            emotionSamples++;
            emotionActionCounts[topEmotion] = (emotionActionCounts[topEmotion] ?? 0) + 1;
            if (expectedEmotionActions[topEmotion].includes(record.action)) emotionMatches++;
        }
        const meanEmotions: Wolf['emotions'] = {
            joy: wolf.stats.samples ? wolf.stats.emotionTotal.joy / wolf.stats.samples : 0,
            fear: wolf.stats.samples ? wolf.stats.emotionTotal.fear / wolf.stats.samples : 0,
            anger: wolf.stats.samples ? wolf.stats.emotionTotal.anger / wolf.stats.samples : 0,
            sadness: wolf.stats.samples ? wolf.stats.emotionTotal.sadness / wolf.stats.samples : 0,
            curiosity: wolf.stats.samples ? wolf.stats.emotionTotal.curiosity / wolf.stats.samples : 0,
        };
        return {
            id: wolf.id,
            name: wolf.name,
            brain: wolf.brain,
            decisions: wolf.stats.decisions,
            strategicDecisions: strategicRecords.length,
            started: startedRecords.length,
            startRate: strategicRecords.length ? startedRecords.length / strategicRecords.length : 0,
            meanStartDelaySeconds: startedRecords.length ? startedRecords.reduce((sum, record) => sum + Math.max(0, (record.startedAt ?? record.time) - record.time), 0) / startedRecords.length : 0,
            decisionChanges: wolf.stats.decisionChanges,
            abandonedPlans: wolf.stats.abandonedPlans,
            changesPerSimHour: wolf.stats.decisionChanges / hours,
            feasibleRate: strategicRecords.length ? feasible.length / strategicRecords.length : 0,
            successfulStrategicActions: wolf.stats.successfulStrategicActions,
            failedStrategicActions: wolf.stats.failedStrategicActions,
            strategicSuccessRate: wolf.stats.successfulStrategicActions + wolf.stats.failedStrategicActions
                ? wolf.stats.successfulStrategicActions / (wolf.stats.successfulStrategicActions + wolf.stats.failedStrategicActions) : 0,
            emotionActionCounts,
            emotionActionMatchRate: emotionSamples ? emotionMatches / emotionSamples : 0,
            emotionActionSamples: emotionSamples,
            meanEmotions,
            threatKills: wolf.stats.threatKills,
            preyKills: wolf.stats.preyKills,
            attackGained: wolf.stats.attackGained,
            maxHealthGained: wolf.stats.maxHealthGained,
            foodGiven: wolf.stats.foodGiven,
            foodReceived: wolf.stats.foodReceived,
            protectionSuccesses: wolf.stats.protectionSuccesses,
            protectionFailures: wolf.stats.protectionFailures,
            finalHealth: wolf.health,
            finalAttack: wolf.attack,
            finalMaxHealth: wolf.maxHealth,
            alphaAtEnd: engine.world.alphaId === wolf.id,
            dominanceWins: wolf.dominanceWins,
            dominanceLosses: wolf.dominanceLosses,
            llmCalls: wolf.stats.llmCalls,
            llmFailures: wolf.stats.llmFailures,
        } satisfies WolfRun;
    });
    runs.push({
        seed,
        seconds: engine.world.time,
        alphaId: engine.world.alphaId,
        conflicts: Object.fromEntries(['pending', 'engaged', 'resolved', 'blocked'].map(status => [status, engine.world.conflicts.filter(conflict => conflict.status === status).length])) as Run['conflicts'],
        events: {
            provocations: engine.world.conflicts.length,
            duels: engine.world.conflicts.filter(conflict => conflict.status === 'resolved').length,
        },
        wolves,
    });
}

const mean = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
const std = (values: number[]) => values.length > 1 ? Math.sqrt(values.reduce((sum, value) => sum + (value - mean(values)) ** 2, 0) / (values.length - 1)) : 0;
const ci95 = (values: number[]) => values.length ? 1.96 * std(values) / Math.sqrt(values.length) : 0;
const fixed = (value: number, digits = 2) => value.toFixed(digits);
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const markdown: string[] = [
    '# Báo cáo đánh giá hành vi — Wolf Mind Sandbox',
    '',
    `- Ngày tạo: ${new Date().toISOString()}`,
    `- Mẫu: ${seedCount} seed liên tiếp (${firstSeed}–${firstSeed + seedCount - 1}), mỗi seed ${hours} giờ mô phỏng (${Math.round(hours * 3600)} giây).`,
    `- Bản đồ: v${map.schemaVersion ?? 1}, ${map.world.width}×${map.world.height} px, nguồn đồng bộ từ frontend/assets/world.`,
    '- Adapter: Mock mặc định; Adam dùng Utility, Eva dùng LLM(Mock), Oden dùng Hybrid(Mock). Đây không phải đánh giá LLM trực tuyến.',
    '- Kịch bản kiểm soát: mỗi seed xuất hiện đúng một mối đe dọa gần một sói (luân phiên Adam/Eva/Oden); môi trường và seed được lưu trong JSON kèm theo.',
    '- Chỉ số “phù hợp cảm xúc” là tương quan quan sát giữa cảm xúc trội ≥ 0,35 và nhóm hành động được định nghĩa dưới đây; không khẳng định quan hệ nhân quả hay năng lực suy nghĩ ẩn.',
    '',
    '## Cách tính',
    '',
    '- **Quyết đoán:** tỷ lệ quyết định chiến lược có bắt đầu hành động; độ trễ trung bình từ lúc quyết định đến lúc bắt đầu; số lần đổi quyết định/giờ và bỏ kế hoạch.',
    '- **Lý trí/khả thi:** tỷ lệ quyết định chiến lược qua điều kiện hợp lệ; tỷ lệ thành công trên số hành động chiến lược đã kết thúc. Đây là proxy định lượng, không phải đánh giá chất lượng kế hoạch của người chơi.',
    '- **Cảm xúc → hành vi:** đếm trạng thái có cảm xúc trội ≥ 0,35 và tỷ lệ hành động khớp nhóm: sợ hãi→FLEE/REST/ATTACK_THREAT; tức giận→CHALLENGE/QUARREL/PROVOKE; vui vẻ→PLAY/GROOM/SHARE_FOOD/HOWL.',
    '- **Bầy đàn/tiến triển:** số lần hạ mồi/đe dọa, tăng sức mạnh, chia/nhận thức ăn, bảo vệ thành công/thất bại, thắng/thua thách đấu, và số seed kết thúc với từng sói làm bá chủ.',
    '',
    '## Kết quả theo sói',
    '',
    '| Sói (brain) | Quyết định chiến lược | Bắt đầu hành động | Trễ bắt đầu TB (s) | Đổi ý/giờ | Bỏ kế hoạch | Điều kiện hợp lệ | Thành công hành động | Cảm xúc khớp (n) |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
];

const wolfIds = runs[0]?.wolves.map(wolf => wolf.id) ?? [];
for (const id of wolfIds) {
    const group = runs.map(run => run.wolves.find(wolf => wolf.id === id)!);
    const first = group[0];
    const metrics: [string, (wolf: WolfRun) => number][] = [
        ['strategicDecisions', wolf => wolf.strategicDecisions],
        ['startRate', wolf => wolf.startRate],
        ['meanStartDelaySeconds', wolf => wolf.meanStartDelaySeconds],
        ['changesPerSimHour', wolf => wolf.changesPerSimHour],
        ['abandonedPlans', wolf => wolf.abandonedPlans],
        ['feasibleRate', wolf => wolf.feasibleRate],
        ['strategicSuccessRate', wolf => wolf.strategicSuccessRate],
        ['emotionActionMatchRate', wolf => wolf.emotionActionMatchRate],
    ];
    const summaries = metrics.map(([name, get]) => {
        const values = group.map(get);
        const display = name.endsWith('Rate') ? percent(mean(values)) : fixed(mean(values));
        return `${display} (95% CI ±${name.endsWith('Rate') ? (ci95(values) * 100).toFixed(1) + ' pp' : fixed(ci95(values))})`;
    });
    markdown.push(`| ${first.name} (${first.brain}) | ${summaries[0]} | ${summaries[1]} | ${summaries[2]} | ${summaries[3]} | ${summaries[4]} | ${summaries[5]} | ${summaries[6]} | ${summaries[7]} (${group.reduce((sum, wolf) => sum + wolf.emotionActionSamples, 0)}) |`);
}

markdown.push('', '## Số liệu tổng hợp của 30 lượt', '');
const allWolves = runs.flatMap(run => run.wolves);
const sumField = (field: keyof WolfRun) => allWolves.reduce((sum, wolf) => sum + (typeof wolf[field] === 'number' ? wolf[field] as number : 0), 0);
const totalConflicts = runs.reduce((sum, run) => sum + run.conflicts.resolved + run.conflicts.blocked + run.conflicts.pending, 0);
const resolvedConflicts = runs.reduce((sum, run) => sum + run.conflicts.resolved, 0);
const blockedConflicts = runs.reduce((sum, run) => sum + run.conflicts.blocked, 0);
const duelCount = runs.reduce((sum, run) => sum + run.events.duels, 0);
markdown.push(
    `- Đối đầu do Eva khơi mào: ${runs.reduce((sum, run) => sum + run.events.provocations, 0)} xung đột; ${duelCount} giao đấu bắt đầu.`,
    `- Xung đột ghi nhận: ${totalConflicts}; giải quyết bằng giao đấu ${resolvedConflicts}; bị chặn/hết thời hạn ${blockedConflicts}; đang chờ ${runs.reduce((sum, run) => sum + run.conflicts.pending, 0)}.`,
    `- Săn mồi: ${sumField('preyKills')} lần; hạ đe dọa: ${sumField('threatKills')} lần; tăng tổng ${sumField('attackGained')} điểm tấn công và ${sumField('maxHealthGained')} máu tối đa.`,
    `- Cho/nhận thức ăn: ${sumField('foodGiven')}/${sumField('foodReceived')}; bảo vệ thành công/thất bại: ${sumField('protectionSuccesses') / 2}/${sumField('protectionFailures') / 2} lượt (mỗi lượt được ghi ở cả sói đầu đàn và thành viên).`,
    `- Tỷ lệ kết thúc mô phỏng với bá chủ: ${percent(runs.filter(run => Boolean(run.alphaId)).length / runs.length)} (${runs.filter(run => Boolean(run.alphaId)).length}/${runs.length}).`,
    `- LLM lỗi: ${sumField('llmFailures')} lần trên ${sumField('llmCalls')} lượt gọi; LLM thời gian thực không tham gia báo cáo này.`,
    '',
    '## Đọc kết quả',
    '',
    '- Tỷ lệ bắt đầu thấp kèm độ trễ cao cho thấy hành động chiến lược thường chưa rời giai đoạn quyết định trong cửa sổ mô phỏng; cần đọc cùng tỷ lệ bị chặn và số lượt hành động.',
    '- Tỷ lệ điều kiện hợp lệ cao chỉ cho biết luật tiền điều kiện chấp nhận quyết định; cần đối chiếu tỷ lệ hành động hoàn tất để thấy khả năng thực thi.',
    '- Chỉ số cảm xúc khớp thấp không đồng nghĩa NPC không có cảm xúc; nó cho biết cảm xúc trội ít đi cùng nhóm hành động đã quy ước trong phép đo này.',
    '- Xem `wolf-agent-evaluation.json` để lấy kết quả từng seed, từng sói và trường dữ liệu đầy đủ; không dùng điểm tổng hợp để kết luận thay cho các số đếm thô.',
    '',
    '## Phân bố theo cá thể',
    '',
    '| Sói | Con mồi hạ (TB) | Đe dọa hạ (TB) | Cho ăn (TB) | Được cho ăn (TB) | Bảo vệ đạt (TB) | Bá chủ cuối lượt | Tấn công cuối (TB) | Máu tối đa cuối (TB) |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
);
for (const id of wolfIds) {
    const group = runs.map(run => run.wolves.find(wolf => wolf.id === id)!);
    const wolf = group[0];
    markdown.push(`| ${wolf.name} | ${fixed(mean(group.map(w => w.preyKills)))} | ${fixed(mean(group.map(w => w.threatKills)))} | ${fixed(mean(group.map(w => w.foodGiven)))} | ${fixed(mean(group.map(w => w.foodReceived)))} | ${fixed(mean(group.map(w => w.protectionSuccesses)))} | ${group.filter(w => w.alphaAtEnd).length}/${runs.length} | ${fixed(mean(group.map(w => w.finalAttack)))} | ${fixed(mean(group.map(w => w.finalMaxHealth)))} |`);
}
markdown.push('', '## Tệp dữ liệu', '', '- JSON chứa phương pháp, cấu hình mẫu, số liệu trung bình và toàn bộ số liệu theo seed.', '');

const outDir = resolve(root, 'reports');
mkdirSync(outDir, {recursive: true});
const json = {
    generatedAt: new Date().toISOString(),
    method: {seedCount, firstSeed, hours, fixedStepSeconds: .1, mapSchemaVersion: map.schemaVersion ?? 1, mapWidth: map.world.width, mapHeight: map.world.height, threatProbe: 'one threat spawned at simulation start near a wolf, cycling Adam/Eva/Oden', adapter: 'Mock', emotionActionGroups: expectedEmotionActions},
    definitions: {strategicActions: [...strategic], metrics: ['decisiveness: action start rate and decision-to-start latency', 'rationality: precondition acceptance and completed strategic-action success', 'emotion: observed dominant emotion/action group match; correlational, not causal']},
    aggregate: {
        conflicts: {total: totalConflicts, resolved: resolvedConflicts, blocked: blockedConflicts, duels: duelCount},
        preyKills: sumField('preyKills'), threatKills: sumField('threatKills'), attackGained: sumField('attackGained'), maxHealthGained: sumField('maxHealthGained'),
        foodGiven: sumField('foodGiven'), foodReceived: sumField('foodReceived'), protectionSuccesses: sumField('protectionSuccesses') / 2, protectionFailures: sumField('protectionFailures') / 2,
        alphaRuns: runs.filter(run => Boolean(run.alphaId)).length,
        byWolf: wolfIds.map(id => {
            const group = runs.map(run => run.wolves.find(wolf => wolf.id === id)!);
            return {id, name: group[0].name, brain: group[0].brain, mean: Object.fromEntries(['strategicDecisions', 'startRate', 'meanStartDelaySeconds', 'changesPerSimHour', 'abandonedPlans', 'feasibleRate', 'strategicSuccessRate', 'emotionActionMatchRate', 'preyKills', 'threatKills', 'foodGiven', 'foodReceived', 'protectionSuccesses', 'protectionFailures', 'finalAttack', 'finalMaxHealth'].map(key => [key, mean(group.map(wolf => Number(wolf[key as keyof WolfRun])))])), ci95: Object.fromEntries(['startRate', 'meanStartDelaySeconds', 'changesPerSimHour', 'feasibleRate', 'strategicSuccessRate', 'emotionActionMatchRate'].map(key => [key, ci95(group.map(wolf => Number(wolf[key as keyof WolfRun])))])), total: Object.fromEntries(['strategicDecisions', 'started', 'decisionChanges', 'abandonedPlans', 'successfulStrategicActions', 'failedStrategicActions', 'emotionActionSamples', 'preyKills', 'threatKills', 'foodGiven', 'foodReceived', 'protectionSuccesses', 'protectionFailures', 'dominanceWins', 'dominanceLosses'].map(key => [key, group.reduce((sum, wolf) => sum + Number(wolf[key as keyof WolfRun]), 0)])), alphaAtEnd: group.filter(wolf => wolf.alphaAtEnd).length};
        }),
    },
    runs,
};
writeFileSync(resolve(outDir, 'wolf-agent-evaluation.md'), `${markdown.join('\n')}\n`, 'utf8');
writeFileSync(resolve(outDir, 'wolf-agent-evaluation.json'), `${JSON.stringify(json, null, 2)}\n`, 'utf8');
console.log(`Completed ${seedCount} seeded runs (${hours} simulated hours each). Reports written to reports/wolf-agent-evaluation.md and .json`);
