import { useMemo, useState } from 'react';

type ConfigVariable = {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'string' | 'select' | 'list';
  category:
    | 'gameplay'
    | 'combat'
    | 'spawning'
    | 'economy'
    | 'permissions'
    | 'worlds'
    | 'performance'
    | 'visuals_sounds'
    | 'crafting'
    | 'anti_abuse'
    | 'general'
    | 'mod';
  defaultValue: string | number | boolean | string[];
  value: string | number | boolean | string[];
  unit?: string;
  min?: number;
  max?: number;
  options?: string[];
  riskLevel: 'low' | 'medium' | 'high';
  inferred: boolean;
  reason: string;
};

type AnalyzerResult = {
  modName: string;
  contentType: string;
  confidence: number;
  detectedFeatures: string[];
  variables: ConfigVariable[];
  warnings: {
    severity: 'info' | 'warning' | 'critical';
    category: string;
    message: string;
    suggestedFix: string;
  }[];
  implementationNotes: string[];
};

const sampleInputs: Record<string, string> = {
  weapon: `Mod Name: Eclipse Arsenal
Adds the Eclipse Blade with three combat modes.
Slash deals 12 damage and applies weakness for 6 seconds.
Void burst deals 7 damage in 8 block radius and applies blindness for 4 seconds.
Shadow lunge cooldown is 15 seconds.
Critical hit chance 20%.
Particle aura spawns 60 particles every 5 ticks.
Recipe: 2 netherite + 1 star core.`,
  boss: `Mod Name: Infernal Warden
Custom boss mob with 600 health in Nether biomes.
Spawn rate is 0.8% at night, max 3 active bosses per world.
Ability: fire nova every 10 seconds, 12 block radius, slowness 3s.
Drops infernal shard at 5% chance and 500 coin reward.
Uses 120 flame particles each tick while enraged.`,
  utility: `Mod Name: Rift Market Relay
Adds teleport pad block and market relay item.
Crafting uses 4 obsidian and 1 ender pearl.
Teleport cooldown 30 seconds and cost 75 coins per use.
Can teleport across dimensions.
Command /market grants discount buff for 60 seconds.
Daily limit 5 uses.`
};

const yamlOrder: ConfigVariable['category'][] = [
  'mod',
  'permissions',
  'worlds',
  'gameplay',
  'combat',
  'spawning',
  'economy',
  'performance',
  'visuals_sounds',
  'anti_abuse'
];

const categoryTitles: Record<ConfigVariable['category'], string> = {
  mod: 'Mod',
  general: 'General',
  permissions: 'Permissions',
  worlds: 'Worlds',
  gameplay: 'Gameplay',
  combat: 'Combat',
  spawning: 'Spawning',
  economy: 'Economy',
  performance: 'Performance',
  visuals_sounds: 'Visuals & Sounds',
  anti_abuse: 'Anti-abuse',
  crafting: 'Crafting'
};

const extractNumber = (text: string, regex: RegExp): number | undefined => {
  const match = text.match(regex);
  return match ? Number(match[1]) : undefined;
};

const analyzeText = (input: string): AnalyzerResult => {
  const text = input.toLowerCase();
  const modName = input.match(/mod name:\s*(.+)/i)?.[1]?.trim() ?? 'Unnamed Generated Mod';

  const hasCombat = /damage|critical|weapon|pvp|weakness|blindness|slowness|combat/.test(text);
  const hasSpawning = /spawn|boss|mob|minion|biome|active/.test(text);
  const hasEconomy = /coin|price|cost|economy|reward|market|currency/.test(text);
  const hasTeleport = /teleport|dimension|portal|rift/.test(text);
  const hasParticles = /particle|aura|tick/.test(text);
  const hasCrafting = /craft|recipe|obsidian|ingot/.test(text);
  const hasDrops = /drop|loot|chance|reward/.test(text);
  const hasAbilities = /cooldown|ability|mode|every\s+\d+\s*seconds/.test(text);

  const detectedFeatures = [
    hasCombat && 'combat',
    hasSpawning && 'spawning',
    hasEconomy && 'economy',
    hasTeleport && 'teleportation',
    hasParticles && 'particles',
    hasCrafting && 'crafting',
    hasDrops && 'drops',
    hasAbilities && 'abilities'
  ].filter(Boolean) as string[];

  const contentType = hasSpawning
    ? 'Mob/Boss System'
    : hasCombat
      ? 'Combat Item/Ability'
      : hasEconomy
        ? 'Utility/Economy Mechanic'
        : 'General Mod Mechanic';

  const vars: ConfigVariable[] = [
    {
      key: 'name',
      label: 'Mod Display Name',
      type: 'string',
      category: 'mod',
      defaultValue: modName,
      value: modName,
      riskLevel: 'low',
      inferred: false,
      reason: 'Identified from generated text.'
    },
    {
      key: 'enabled',
      label: 'Enable Mod Feature',
      type: 'boolean',
      category: 'mod',
      defaultValue: true,
      value: true,
      riskLevel: 'low',
      inferred: true,
      reason: 'Global on/off switch is essential for rollback.'
    },
    {
      key: 'node',
      label: 'Permission Node',
      type: 'string',
      category: 'permissions',
      defaultValue: 'minecraftmod.use',
      value: 'minecraftmod.use',
      riskLevel: 'low',
      inferred: true,
      reason: 'Permission gates are required for multiplayer control.'
    },
    {
      key: 'disabled_worlds',
      label: 'Disabled Worlds',
      type: 'list',
      category: 'worlds',
      defaultValue: ['lobby', 'spawn'],
      value: ['lobby', 'spawn'],
      riskLevel: 'medium',
      inferred: true,
      reason: 'Protect lobby/spawn by default.'
    }
  ];

  const cooldown = extractNumber(text, /cooldown\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*seconds?/);
  if (hasAbilities) {
    vars.push({
      key: 'cooldown_seconds',
      label: 'Action Cooldown',
      type: 'number',
      category: 'gameplay',
      defaultValue: cooldown ?? 15,
      value: cooldown ?? 15,
      unit: 'seconds',
      min: 1,
      max: 300,
      riskLevel: 'medium',
      inferred: !cooldown,
      reason: 'Ability actions should be rate-limited.'
    });
  }

  if (hasCombat) {
    const damage = extractNumber(text, /deals?\s*(\d+(?:\.\d+)?)\s*damage/);
    const radius = extractNumber(text, /(\d+(?:\.\d+)?)\s*block\s*radius/);
    vars.push({ key: 'pvp_only', label: 'PvP Only', type: 'boolean', category: 'combat', defaultValue: true, value: true, riskLevel: 'medium', inferred: true, reason: 'Combat mechanics should be scoped.' });
    vars.push({ key: 'base_damage', label: 'Base Damage', type: 'number', category: 'combat', defaultValue: damage ?? 8, value: damage ?? 8, min: 0, max: 100, riskLevel: 'high', inferred: !damage, reason: 'Damage tuning affects balance.' });
    if (radius) vars.push({ key: 'aoe_radius', label: 'AoE Radius', type: 'number', category: 'combat', defaultValue: radius, value: radius, min: 1, max: 64, unit: 'blocks', riskLevel: 'high', inferred: false, reason: 'Explicit radius extracted from text.' });
  }

  if (hasSpawning) {
    const health = extractNumber(text, /(\d+(?:\.\d+)?)\s*health/);
    const spawnRate = extractNumber(text, /spawn rate\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*%/);
    vars.push({ key: 'max_active_entities', label: 'Max Active Entities', type: 'number', category: 'spawning', defaultValue: 3, value: 3, min: 1, max: 100, riskLevel: 'high', inferred: true, reason: 'Caps prevent runaway mob spam.' });
    vars.push({ key: 'spawn_rate_percent', label: 'Spawn Rate', type: 'number', category: 'spawning', defaultValue: spawnRate ?? 1, value: spawnRate ?? 1, unit: '%', min: 0, max: 100, riskLevel: 'high', inferred: !spawnRate, reason: 'Spawn frequency controls load.' });
    if (health) vars.push({ key: 'mob_health', label: 'Mob Health', type: 'number', category: 'spawning', defaultValue: health, value: health, min: 1, max: 5000, riskLevel: 'high', inferred: false, reason: 'Boss/mob health extracted.' });
  }

  if (hasDrops) {
    const dropChance = extractNumber(text, /(\d+(?:\.\d+)?)\s*%\s*chance/);
    vars.push({ key: 'drop_chance_percent', label: 'Drop Chance', type: 'number', category: 'economy', defaultValue: dropChance ?? 5, value: dropChance ?? 5, min: 0, max: 100, unit: '%', riskLevel: 'medium', inferred: !dropChance, reason: 'Loot rates impact progression and economy.' });
  }

  if (hasEconomy) {
    const cost = extractNumber(text, /cost\s*(\d+(?:\.\d+)?)\s*coins?/);
    vars.push({ key: 'action_cost', label: 'Action Cost', type: 'number', category: 'economy', defaultValue: cost ?? 50, value: cost ?? 50, min: 0, max: 100000, riskLevel: 'medium', inferred: !cost, reason: 'Currency sinks should be configurable.' });
    vars.push({ key: 'max_daily_reward', label: 'Daily Currency Cap', type: 'number', category: 'economy', defaultValue: 1000, value: 1000, min: 0, max: 100000, riskLevel: 'high', inferred: true, reason: 'Protects against economy inflation.' });
  }

  if (hasParticles) {
    vars.push({ key: 'effect_tick_interval', label: 'Effect Tick Interval', type: 'number', category: 'performance', defaultValue: 10, value: 10, min: 1, max: 200, unit: 'ticks', riskLevel: 'high', inferred: true, reason: 'Tick interval impacts TPS usage.' });
    vars.push({ key: 'particle_density_multiplier', label: 'Particle Density', type: 'number', category: 'visuals_sounds', defaultValue: 0.6, value: 0.6, min: 0, max: 2, riskLevel: 'high', inferred: true, reason: 'Particle load should be tunable.' });
  }

  if (hasTeleport) {
    vars.push({ key: 'cross_dimension_teleport', label: 'Allow Cross-Dimension Teleport', type: 'boolean', category: 'anti_abuse', defaultValue: false, value: false, riskLevel: 'high', inferred: true, reason: 'Teleportation can bypass protections.' });
  }

  const warnings: AnalyzerResult['warnings'] = [];
  if (/buff|effect|weakness|blindness|slowness/.test(text)) warnings.push({ severity: 'warning', category: 'balance', message: 'Too many stacked effects can hurt PvP balance.', suggestedFix: 'Limit concurrent effects and expose durations.' });
  if (/blindness|weakness|slowness/.test(text)) warnings.push({ severity: 'critical', category: 'combat', message: 'AoE control effects may feel oppressive.', suggestedFix: 'Reduce radius/duration and restrict PvP worlds.' });
  if (hasParticles) warnings.push({ severity: 'warning', category: 'performance', message: 'Frequent particles/ticks may reduce TPS.', suggestedFix: 'Increase tick interval and lower particle density.' });
  if (hasSpawning) warnings.push({ severity: 'warning', category: 'spawning', message: 'Boss/mob features require spawn caps and world limits.', suggestedFix: 'Use max active caps and allowed world/biome lists.' });
  if (hasDrops || hasEconomy) warnings.push({ severity: 'warning', category: 'economy', message: 'Reward loops can inflate currency value.', suggestedFix: 'Apply daily caps and tune drop chance.' });
  if (hasTeleport) warnings.push({ severity: 'critical', category: 'anti_abuse', message: 'Teleport mechanics can bypass safe zones.', suggestedFix: 'Disable in spawn/lobby worlds and require permissions.' });
  warnings.push({ severity: 'info', category: 'world-safety', message: 'Generated features should be disabled in lobby/spawn by default.', suggestedFix: 'Keep disabled_worlds populated unless intentionally overridden.' });

  const implementationNotes = [
    'Map these keys directly into your plugin config reader to keep naming consistent.',
    'Validate min/max values at startup and log warnings for unsafe values.',
    'Run world + permission checks before every action execution path.'
  ];

  return {
    modName,
    contentType,
    confidence: Math.min(0.98, 0.5 + detectedFeatures.length * 0.06),
    detectedFeatures,
    variables: vars,
    warnings,
    implementationNotes
  };
};

function App() {
  const [input, setInput] = useState(sampleInputs.weapon);
  const [result, setResult] = useState<AnalyzerResult | null>(null);

  const grouped = useMemo(() => {
    if (!result) return {} as Record<string, ConfigVariable[]>;
    return result.variables.reduce((acc, v) => {
      acc[v.category] = [...(acc[v.category] ?? []), v];
      return acc;
    }, {} as Record<string, ConfigVariable[]>);
  }, [result]);

  const yaml = useMemo(() => {
    if (!result) return '';
    let output = `# Server-ready config.yml generated from mod text\n`;
    for (const category of yamlOrder) {
      const values = grouped[category];
      if (!values?.length) continue;
      output += `\n${category}:\n`;
      for (const item of values) {
        output += `  # ${item.reason}${item.inferred ? ' (inferred)' : ''}${item.riskLevel === 'high' ? ' [high-risk]' : ''}\n`;
        const value = Array.isArray(item.value)
          ? `[${item.value.map((v) => `"${v}"`).join(', ')}]`
          : typeof item.value === 'string'
            ? `"${item.value}"`
            : item.value;
        output += `  ${item.key}: ${value}\n`;
      }
    }
    return output;
  }, [grouped, result]);

  const updateVariable = (target: ConfigVariable, value: string | number | boolean | string[]) => {
    setResult((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        variables: previous.variables.map((item) => (item.key === target.key ? { ...item, value } : item))
      };
    });
  };

  const downloadYaml = () => {
    const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'config.yml';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h1>Minecraft Mod Configurator</h1>
      <div className="explanation-card">
        Generated mods are creative, but multiplayer servers need configurable limits, permissions, world restrictions, and performance controls. This prototype scans generated mod output and creates a server-ready config layer.
      </div>
      <div className="top-controls">
        <select onChange={(e) => setInput(sampleInputs[e.target.value])}>
          <option value="weapon">Load Sample: Weapon/Combat</option>
          <option value="boss">Load Sample: Boss/Spawning/Drops</option>
          <option value="utility">Load Sample: Utility/Economy/Teleport</option>
        </select>
        <button onClick={() => setResult(analyzeText(input))}>Analyze Configurability</button>
      </div>
      <textarea rows={12} value={input} onChange={(e) => setInput(e.target.value)} />

      {result && (
        <>
          <section>
            <h2>Analysis Overview</h2>
            <p><b>Mod:</b> {result.modName} | <b>Type:</b> {result.contentType} | <b>Confidence:</b> {(result.confidence * 100).toFixed(0)}%</p>
            <p><b>Detected Features:</b> {result.detectedFeatures.join(', ')}</p>
          </section>

          <section>
            <h2>Server Settings</h2>
            {yamlOrder.map((category) => {
              const values = grouped[category];
              if (!values?.length) return null;
              return (
                <div key={category} className="category-block">
                  <h3>{categoryTitles[category]}</h3>
                  {values.map((item) => (
                    <div className="setting" key={`${category}-${item.key}`}>
                      <div className="setting-head">
                        <label>{item.label}</label>
                        <span className={`risk ${item.riskLevel}`}>{item.riskLevel.toUpperCase()} RISK</span>
                      </div>
                      {item.type === 'boolean' ? (
                        <input type="checkbox" checked={Boolean(item.value)} onChange={(e) => updateVariable(item, e.target.checked)} />
                      ) : item.type === 'list' ? (
                        <input value={(item.value as string[]).join(', ')} onChange={(e) => updateVariable(item, e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} />
                      ) : (
                        <input type={item.type === 'number' ? 'number' : 'text'} value={String(item.value)} onChange={(e) => updateVariable(item, item.type === 'number' ? Number(e.target.value) : e.target.value)} />
                      )}
                      <small>{item.reason} {item.inferred ? '(Inferred)' : '(Detected)'}</small>
                    </div>
                  ))}
                </div>
              );
            })}
          </section>

          <section>
            <h2>Warnings</h2>
            {result.warnings.map((warning, index) => (
              <div key={index} className={`warn ${warning.severity}`}>
                <b>{warning.severity.toUpperCase()}</b> [{warning.category}] {warning.message}<br />
                Fix: {warning.suggestedFix}
              </div>
            ))}
          </section>

          <section>
            <h2>config.yml Export</h2>
            <div className="yaml-actions">
              <button onClick={() => navigator.clipboard.writeText(yaml)}>Copy config.yml</button>
              <button onClick={downloadYaml}>Download config.yml</button>
            </div>
            <pre>{yaml}</pre>
          </section>

          <section>
            <h2>Implementation Notes</h2>
            <ul>
              {result.implementationNotes.map((note) => (<li key={note}>{note}</li>))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
