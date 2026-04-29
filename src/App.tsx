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
    | 'general';
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

const samples: Record<string, string> = {
  weapon: `Mod Name: Eclipse Arsenal\nAdds the Eclipse Blade with three modes: slash, void burst, and shadow lunge.\nSlash deals 12 damage and applies weakness for 6 seconds.\nVoid burst has 8 block radius, deals 7 damage, and applies blindness for 4 seconds.\nShadow lunge cooldown is 15 seconds and grants speed 2 for 5 seconds.\nCritical hit chance: 20%.\nParticle aura spawns 60 particles every 5 ticks.\nCrafting cost: 2 netherite ingots + 1 star core.\nEnabled in survival and PvP arenas.",
  boss: `Mod Name: Infernal Warden\nAdds a custom boss mob with 600 health in Nether biomes.\nSpawn rate is 0.8% at night, max 3 active bosses per world.\nBoss ability: fire nova every 10 seconds with 12 block radius and slowness for 3s.\nDrops infernal shard with 5% chance and 500 coin reward on kill.\nUses flame particles: 120 per tick during enraged phase.\nCan summon minions every 20 seconds.",
  utility: `Mod Name: Rift Market Relay\nAdds a teleport pad block and market relay item.\nPlayers can craft teleport pad for 4 obsidian + 1 ender pearl.\nTeleport cooldown 30 seconds, cost 75 coins per use.\nAllows teleport across dimensions unless blocked.\nRelay command /market grants random discount 10% for 60 seconds.\nDaily limit 5 uses.\nRecommended for economy and utility servers.`
};

const categories: ConfigVariable['category'][] = [
  'general','gameplay','combat','spawning','economy','permissions','worlds','performance','visuals_sounds','crafting','anti_abuse'
];

const labelMap: Record<ConfigVariable['category'], string> = {
  general:'General',gameplay:'Gameplay',combat:'Combat',spawning:'Spawning',economy:'Economy',permissions:'Permissions',worlds:'Worlds',performance:'Performance',visuals_sounds:'Visuals & Sounds',crafting:'Crafting',anti_abuse:'Anti-abuse'
};

const detectNumber = (text: string, pattern: RegExp) => {
  const match = text.match(pattern);
  return match ? Number(match[1]) : undefined;
};

function analyzeText(text: string): AnalyzerResult {
  const source = text.toLowerCase();
  const modName = text.match(/mod name:\s*(.+)/i)?.[1]?.trim() || 'Unnamed Generated Mod';
  const features: string[] = [];
  const vars: ConfigVariable[] = [];
  const warnings: AnalyzerResult['warnings'] = [];
  const notes: string[] = [];

  const hasCombat = /damage|pvp|weapon|critical|slash|blindness|weakness|slowness/.test(source);
  const hasSpawning = /spawn|mob|boss|minion|biome/.test(source);
  const hasEconomy = /coin|currency|price|cost|shop|market|reward/.test(source);
  const hasTeleport = /teleport|dimension|rift|portal/.test(source);
  const hasParticles = /particle|aura|tick/.test(source);
  const hasCrafting = /craft|recipe|ingot|obsidian/.test(source);
  const hasDrops = /drop|chance|loot|reward/.test(source);
  const hasAbilities = /ability|cooldown|every\s+\d+\s*seconds|mode/.test(source);

  const contentType = hasSpawning ? 'Mob/Boss System' : hasCombat ? 'Combat Item/Ability' : hasEconomy ? 'Economy/Utility Mechanic' : 'General Mod Feature';
  [hasCombat && 'combat', hasSpawning && 'spawning', hasEconomy && 'economy', hasTeleport && 'teleportation', hasParticles && 'particles', hasCrafting && 'crafting', hasDrops && 'drops', hasAbilities && 'abilities']
    .filter(Boolean)
    .forEach((f) => features.push(String(f)));

  vars.push({ key:'enabled', label:'Feature Enabled', type:'boolean', category:'general', defaultValue:true, value:true, riskLevel:'low', inferred:true, reason:'Always provide global enable toggle.' });
  vars.push({ key:'permission_node', label:'Permission Node', type:'string', category:'permissions', defaultValue:'minecraftmod.use', value:'minecraftmod.use', riskLevel:'low', inferred:true, reason:'Server owners need permission control.' });
  vars.push({ key:'disabled_worlds', label:'Disabled Worlds', type:'list', category:'worlds', defaultValue:['lobby','spawn'], value:['lobby','spawn'], riskLevel:'medium', inferred:true, reason:'Generated features should be blocked in protected worlds.' });

  const cooldown = detectNumber(source, /cooldown\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*seconds?/);
  if (hasAbilities || cooldown) vars.push({ key:'ability_cooldown_seconds', label:'Ability Cooldown', type:'number', category:'gameplay', defaultValue:cooldown ?? 15, value:cooldown ?? 15, min:1, max:300, unit:'seconds', riskLevel:'medium', inferred:!cooldown, reason:'Abilities and action loops require cooldowns.' });

  const damage = detectNumber(source, /deals?\s*(\d+(?:\.\d+)?)\s*damage/);
  if (hasCombat) {
    vars.push({ key:'pvp_only', label:'PvP Only', type:'boolean', category:'combat', defaultValue:true, value:true, riskLevel:'medium', inferred:true, reason:'Combat systems often require PvP scoping.' });
    vars.push({ key:'base_damage', label:'Base Damage', type:'number', category:'combat', defaultValue:damage ?? 8, value:damage ?? 8, min:0, max:100, riskLevel:'high', inferred:!damage, reason:'Damage should be configurable for balance.' });
  }

  const radius = detectNumber(source, /(\d+(?:\.\d+)?)\s*block\s*radius/);
  if (radius) vars.push({ key:'ability_radius', label:'Ability Radius', type:'number', category:'combat', defaultValue:radius, value:radius, min:1, max:64, unit:'blocks', riskLevel:'high', inferred:false, reason:'Explicit AoE radius detected.' });

  const health = detectNumber(source, /(\d+(?:\.\d+)?)\s*health/);
  const spawnRate = detectNumber(source, /spawn rate\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*%/);
  if (hasSpawning) {
    vars.push({ key:'max_active_entities', label:'Max Active Entities', type:'number', category:'spawning', defaultValue:3, value:3, min:1, max:100, riskLevel:'high', inferred:true, reason:'Spawned entities require active caps.' });
    vars.push({ key:'spawn_rate_percent', label:'Spawn Rate', type:'number', category:'spawning', defaultValue:spawnRate ?? 1, value:spawnRate ?? 1, unit:'%', min:0, max:100, riskLevel:'high', inferred:!spawnRate, reason:'Spawn frequency strongly impacts gameplay and TPS.' });
    vars.push({ key:'allowed_biomes', label:'Allowed Biomes', type:'list', category:'spawning', defaultValue:['nether_wastes'], value:['nether_wastes'], riskLevel:'medium', inferred:true, reason:'Biome restrictions prevent overexposure.' });
    if (health) vars.push({ key:'mob_health', label:'Mob/Boss Health', type:'number', category:'spawning', defaultValue:health, value:health, min:1, max:5000, riskLevel:'high', inferred:false, reason:'Explicit mob health detected.' });
  }

  if (hasDrops) {
    const dropChance = detectNumber(source, /(\d+(?:\.\d+)?)\s*%\s*chance/);
    vars.push({ key:'drop_chance_percent', label:'Drop Chance', type:'number', category:'economy', defaultValue:dropChance ?? 5, value:dropChance ?? 5, min:0, max:100, unit:'%', riskLevel:'medium', inferred:!dropChance, reason:'Drop rates affect progression/economy.' });
  }

  if (hasEconomy) {
    const price = detectNumber(source, /cost\s*(\d+(?:\.\d+)?)\s*coins?/);
    vars.push({ key:'max_daily_reward', label:'Max Daily Currency Reward', type:'number', category:'economy', defaultValue:1000, value:1000, min:0, max:100000, riskLevel:'high', inferred:true, reason:'Economy features need anti-inflation caps.' });
    vars.push({ key:'action_cost', label:'Action Cost', type:'number', category:'economy', defaultValue:price ?? 50, value:price ?? 50, min:0, max:100000, riskLevel:'medium', inferred:!price, reason:'Explicit or inferred currency cost control.' });
  }

  if (hasParticles) {
    vars.push({ key:'particle_density_multiplier', label:'Particle Density', type:'number', category:'visuals_sounds', defaultValue:0.6, value:0.6, min:0, max:2, riskLevel:'high', inferred:true, reason:'Visual load should be tunable for TPS.' });
    vars.push({ key:'effect_tick_interval', label:'Effect Tick Interval', type:'number', category:'performance', defaultValue:10, value:10, min:1, max:200, unit:'ticks', riskLevel:'high', inferred:true, reason:'Tick frequency impacts performance.' });
  }

  if (hasCrafting) vars.push({ key:'recipe_enabled', label:'Recipe Enabled', type:'boolean', category:'crafting', defaultValue:true, value:true, riskLevel:'low', inferred:true, reason:'Server owners may disable recipes.' });
  if (hasTeleport) vars.push({ key:'teleport_cross_dimension', label:'Allow Cross-Dimension Teleport', type:'boolean', category:'anti_abuse', defaultValue:false, value:false, riskLevel:'high', inferred:true, reason:'Cross-dimension travel can be abused.' });

  if (/buff|effect|weakness|blindness|slowness/.test(source)) warnings.push({ severity:'warning', category:'balance', message:'Too many simultaneous buffs/debuffs can destabilize PvP balance.', suggestedFix:'Limit concurrent effects and expose effect duration multipliers.' });
  if (/blindness|weakness|slowness/.test(source)) warnings.push({ severity:'critical', category:'combat', message:'AoE control effects may feel oppressive in PvP.', suggestedFix:'Reduce radius/duration and enable PvP-only whitelist worlds.' });
  if (hasParticles) warnings.push({ severity:'warning', category:'performance', message:'High-frequency particles and tick effects can reduce TPS.', suggestedFix:'Lower particle density and raise tick intervals.' });
  if (hasSpawning) warnings.push({ severity:'warning', category:'spawning', message:'Mobs/bosses require strict spawn caps and world restrictions.', suggestedFix:'Use max active caps and biome/world allowlists.' });
  if (hasDrops || hasEconomy) warnings.push({ severity:'warning', category:'economy', message:'Drops and currency rewards can inflate server economy.', suggestedFix:'Apply daily caps and dynamic drop chance throttles.' });
  if (hasTeleport) warnings.push({ severity:'critical', category:'anti_abuse', message:'Teleport/dimension mechanics can bypass protected areas.', suggestedFix:'Disable in spawn worlds and add cooldown + permission checks.' });
  if (/explosion|fire|destructive|grief/.test(source)) warnings.push({ severity:'critical', category:'griefing', message:'Destructive effects can enable griefing.', suggestedFix:'Disable block damage by default and gate by permission.' });
  warnings.push({ severity:'info', category:'world-safety', message:'Generated features should be disabled in lobby/spawn worlds by default.', suggestedFix:'Keep lobby and spawn in disabled_worlds unless explicitly allowed.' });

  notes.push('Map each variable key directly into your plugin config loader to minimize mismatch between prototype and implementation.');
  notes.push('Validate min/max constraints at plugin startup and log warnings when server edits exceed safe ranges.');
  notes.push('Apply world checks before action execution (combat, teleport, spawning) to prevent bypasses.');

  return { modName, contentType, confidence: Math.min(0.98, 0.5 + features.length * 0.06), detectedFeatures: features, variables: vars, warnings, implementationNotes: notes };
}

function App() {
  const [input, setInput] = useState(samples.weapon);
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
    let out = `# Generated config.yml for ${result.modName}\n`;
    for (const category of categories) {
      const vars = grouped[category];
      if (!vars?.length) continue;
      out += `\n${category}:\n`;
      for (const v of vars) {
        out += `  # ${v.reason}${v.inferred ? ' (inferred)' : ''}${v.riskLevel !== 'low' ? ` [risk:${v.riskLevel}]` : ''}\n`;
        const val = Array.isArray(v.value) ? `[${v.value.map((i) => `"${i}"`).join(', ')}]` : typeof v.value === 'string' ? `"${v.value}"` : v.value;
        out += `  ${v.key}: ${val}\n`;
      }
    }
    return out;
  }, [grouped, result]);

  return <div className="container"> <h1>Minecraft Mod Configurator</h1>
    <p>Paste generated mod output, infer server-ready controls, edit values, then export config.yml.</p>
    <div className="top-controls">
      <select onChange={(e) => setInput(samples[e.target.value])}>
        <option value="weapon">Load Sample: Weapon modes</option>
        <option value="boss">Load Sample: Boss mob</option>
        <option value="utility">Load Sample: Utility/economy</option>
      </select>
      <button onClick={() => setResult(analyzeText(input))}>Analyze Configurability</button>
    </div>
    <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} />

    {result && <>
      <section><h2>Analysis</h2><p><b>Mod:</b> {result.modName} | <b>Type:</b> {result.contentType} | <b>Confidence:</b> {(result.confidence*100).toFixed(0)}%</p>
      <p><b>Detected Features:</b> {result.detectedFeatures.join(', ')}</p></section>
      <section><h2>Server Settings</h2>
      {categories.map((cat) => grouped[cat]?.length ? <div key={cat}><h3>{labelMap[cat]}</h3>{grouped[cat].map((v, idx)=><div className="var" key={v.key+idx}><label>{v.label}</label>
      {v.type === 'boolean' ? <input type="checkbox" checked={Boolean(v.value)} onChange={(e)=>setResult((prev)=>prev?{...prev,variables:prev.variables.map((pv)=>pv.key===v.key?{...pv,value:e.target.checked}:pv)}:prev)} />
      : v.type === 'list' ? <input value={(v.value as string[]).join(', ')} onChange={(e)=>setResult((prev)=>prev?{...prev,variables:prev.variables.map((pv)=>pv.key===v.key?{...pv,value:e.target.value.split(',').map((s)=>s.trim()).filter(Boolean)}:pv)}:prev)} />
      : <input type={v.type === 'number' ? 'number' : 'text'} value={String(v.value)} onChange={(e)=>setResult((prev)=>prev?{...prev,variables:prev.variables.map((pv)=>pv.key===v.key?{...pv,value:v.type==='number'?Number(e.target.value):e.target.value}:pv)}:prev)} />}
      <small>{v.reason} {v.inferred ? '(Inferred)' : '(Detected)'}</small></div>)}</div> : null)}
      </section>
      <section><h2>Warnings</h2>{result.warnings.map((w,i)=><div className={`warn ${w.severity}`} key={i}><b>{w.severity.toUpperCase()}</b> [{w.category}] {w.message} Fix: {w.suggestedFix}</div>)}</section>
      <section><h2>config.yml</h2><button onClick={()=>navigator.clipboard.writeText(yaml)}>Copy config.yml</button><pre>{yaml}</pre></section>
      <section><h2>Plugin Implementation Notes</h2><ul>{result.implementationNotes.map((n,i)=><li key={i}>{n}</li>)}</ul></section>
    </>}
  </div>;
}

export default App;
