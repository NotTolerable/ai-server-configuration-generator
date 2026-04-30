import { useMemo, useState } from 'react';

type ContentType =
  | 'weapon'
  | 'armor'
  | 'tool'
  | 'item'
  | 'mob/boss'
  | 'block'
  | 'dimension'
  | 'structure'
  | 'economy system'
  | 'command system';

type ControlCategory = 'Gameplay' | 'Combat' | 'Effects' | 'Visuals & Sounds' | 'Multiplayer Safety' | 'Advanced';
type ControlInput = 'slider' | 'toggle' | 'select' | 'number' | 'tags';

type CreatorControl = {
  key: string;
  label: string;
  category: ControlCategory;
  input: ControlInput;
  value: number | boolean | string | string[];
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  risk: 'low' | 'medium' | 'high';
  source: 'explicit' | 'inferred';
  reason: string;
};

type AnalyzerResult = {
  modName: string;
  target: string;
  primaryContentType: ContentType;
  detectedMechanics: string[];
  confidence: number;
  controls: CreatorControl[];
};

const sampleGeneratedOutput = `Mod Name: Soul Reaper Kyoraku Blade
Target: Fabric 1.21.5
Generated Result: Playable Fabric mod jar for custom katana item with three transformation modes.
Modes: Sealed, Shikai, Bankai.
Sealed mode adds +4 damage.
Shikai mode adds +9 damage and inflicts weakness for 6 seconds (amplifier 1).
Bankai mode adds +14 damage and inflicts blindness and slowness for 4 seconds (amplifier 2).
Transformation cooldown: 18 seconds.
Bankai slash emits void wave with 7 block AoE radius, max 5 affected targets.
Particles: crimson aura intensity 70.
Sounds: slash and transform sounds enabled.
PvP compatibility enabled in combat worlds.
Disabled worlds: lobby, spawn.
Recipe enabled.`;

const extractNum = (text: string, regex: RegExp) => {
  const m = text.match(regex);
  return m ? Number(m[1]) : undefined;
};

function analyzeGeneratedMod(text: string): AnalyzerResult {
  const s = text.toLowerCase();
  const modName = text.match(/mod name:\s*(.+)/i)?.[1]?.trim() ?? 'Unnamed Generated Mod';

  const primaryContentType: ContentType = /weapon|blade|katana|sword/.test(s)
    ? 'weapon'
    : /boss|mob/.test(s)
      ? 'mob/boss'
      : /armor/.test(s)
        ? 'armor'
        : /tool/.test(s)
          ? 'tool'
          : /dimension/.test(s)
            ? 'dimension'
            : /structure/.test(s)
              ? 'structure'
              : /economy|currency/.test(s)
                ? 'economy system'
                : /command/.test(s)
                  ? 'command system'
                  : /block/.test(s)
                    ? 'block'
                    : 'item';

  const detectedMechanics = [
    /damage|combat/.test(s) && 'combat',
    /weakness|blindness|slowness|effect/.test(s) && 'status effects',
    /mode|sealed|shikai|bankai|transform/.test(s) && 'transformation modes',
    /particle|aura/.test(s) && 'particles',
    /sound/.test(s) && 'sounds',
    /aoe|radius/.test(s) && 'aoe',
    /cooldown/.test(s) && 'cooldowns',
    /recipe|craft/.test(s) && 'recipes',
    /drop|loot/.test(s) && 'drops',
    /spawn|mob|boss/.test(s) && 'spawning',
    /teleport|dimension/.test(s) && 'teleportation'
  ].filter(Boolean) as string[];

  const controls: CreatorControl[] = [];
  const sealed = extractNum(s, /sealed mode adds \+(\d+)/) ?? 4;
  const shikai = extractNum(s, /shikai mode adds \+(\d+)/) ?? 9;
  const bankai = extractNum(s, /bankai mode adds \+(\d+)/) ?? 14;
  const cd = extractNum(s, /cooldown:\s*(\d+)/) ?? 18;
  const aoe = extractNum(s, /(\d+)\s*block\s*aoe\s*radius/) ?? 7;
  const maxTargets = extractNum(s, /max\s*(\d+)\s*affected\s*targets/) ?? 5;
  const effectDuration = extractNum(s, /for\s*(\d+)\s*seconds/) ?? 6;
  const amplifier = extractNum(s, /amplifier\s*(\d+)/) ?? 1;
  const particles = extractNum(s, /intensity\s*(\d+)/) ?? 70;

  if (primaryContentType === 'weapon') {
    controls.push(
      { key: 'sealed_damage_bonus', label: 'Sealed Damage Bonus', category: 'Combat', input: 'slider', value: sealed, min: 0, max: 20, step: 1, risk: 'medium', source: sealed ? 'explicit' : 'inferred', reason: 'Weapon baseline tuning.' },
      { key: 'shikai_damage_bonus', label: 'Shikai Damage Bonus', category: 'Combat', input: 'slider', value: shikai, min: 0, max: 30, step: 1, risk: 'high', source: shikai ? 'explicit' : 'inferred', reason: 'Major impact on PvP balance.' },
      { key: 'bankai_damage_bonus', label: 'Bankai Damage Bonus', category: 'Combat', input: 'slider', value: bankai, min: 0, max: 40, step: 1, risk: 'high', source: bankai ? 'explicit' : 'inferred', reason: 'Peak mode burst damage control.' },
      { key: 'transformation_cooldown_seconds', label: 'Transformation Cooldown', category: 'Gameplay', input: 'slider', value: cd, min: 1, max: 90, step: 1, risk: 'medium', source: cd ? 'explicit' : 'inferred', reason: 'Prevents rapid mode cycling.' },
      { key: 'aoe_radius', label: 'AoE Radius', category: 'Effects', input: 'slider', value: aoe, min: 1, max: 16, step: 1, risk: 'high', source: aoe ? 'explicit' : 'inferred', reason: 'Controls area impact and crowd pressure.' },
      { key: 'max_affected_targets', label: 'Max Affected Targets', category: 'Multiplayer Safety', input: 'number', value: maxTargets, min: 1, max: 20, risk: 'high', source: maxTargets ? 'explicit' : 'inferred', reason: 'Caps chain-hit load and PvP oppression.' },
      { key: 'effect_duration_seconds', label: 'Effect Duration', category: 'Effects', input: 'slider', value: effectDuration, min: 0, max: 20, step: 1, risk: 'high', source: effectDuration ? 'explicit' : 'inferred', reason: 'Status effect control for fairness.' },
      { key: 'effect_amplifier', label: 'Effect Amplifier Level', category: 'Effects', input: 'select', value: String(amplifier), options: ['0','1','2','3'], risk: 'high', source: amplifier ? 'explicit' : 'inferred', reason: 'Amplifier strongly shifts combat outcomes.' },
      { key: 'particle_intensity', label: 'Particle Intensity', category: 'Visuals & Sounds', input: 'slider', value: particles, min: 0, max: 100, step: 1, risk: 'medium', source: particles ? 'explicit' : 'inferred', reason: 'Performance and visual noise tuning.' },
      { key: 'sound_effects_enabled', label: 'Sound Effects Enabled', category: 'Visuals & Sounds', input: 'toggle', value: /sounds?.+enabled/.test(s), risk: 'low', source: 'explicit', reason: 'Audio preference and feedback control.' },
      { key: 'pvp_enabled', label: 'PvP Enabled', category: 'Multiplayer Safety', input: 'toggle', value: /pvp.+enabled/.test(s), risk: 'high', source: 'explicit', reason: 'Critical safety control for server rule sets.' },
      { key: 'disabled_worlds', label: 'Disabled Worlds', category: 'Multiplayer Safety', input: 'tags', value: ['lobby', 'spawn'], risk: 'medium', source: /disabled worlds/.test(s) ? 'explicit' : 'inferred', reason: 'Protect non-combat worlds.' },
      { key: 'sealed_mode_enabled', label: 'Sealed Mode Enabled', category: 'Advanced', input: 'toggle', value: true, risk: 'low', source: 'inferred', reason: 'Mode feature flag for fast tuning.' },
      { key: 'shikai_mode_enabled', label: 'Shikai Mode Enabled', category: 'Advanced', input: 'toggle', value: true, risk: 'medium', source: 'inferred', reason: 'Mode feature gate for balance seasons.' },
      { key: 'bankai_mode_enabled', label: 'Bankai Mode Enabled', category: 'Advanced', input: 'toggle', value: true, risk: 'high', source: 'inferred', reason: 'High power mode should be quickly switchable.' }
    );
  }

  return { modName, target: 'Fabric 1.21.5', primaryContentType, detectedMechanics, confidence: 0.92, controls };
}

const categories: ControlCategory[] = ['Gameplay', 'Combat', 'Effects', 'Visuals & Sounds', 'Multiplayer Safety', 'Advanced'];

export default function App() {
  const [generatedOutput] = useState(sampleGeneratedOutput);
  const [result, setResult] = useState<AnalyzerResult | null>(null);

  const grouped = useMemo(() => {
    if (!result) return {} as Record<ControlCategory, CreatorControl[]>;
    return result.controls.reduce((acc, item) => {
      acc[item.category] = [...(acc[item.category] ?? []), item];
      return acc;
    }, {} as Record<ControlCategory, CreatorControl[]>);
  }, [result]);

  const updateControl = (key: string, value: CreatorControl['value']) => {
    setResult((prev) => prev ? { ...prev, controls: prev.controls.map((c) => c.key === key ? { ...c, value } : c) } : prev);
  };

  const schemaPreview = useMemo(() => result ? JSON.stringify({ creatorControls: result.controls }, null, 2) : '', [result]);
  const configPreview = useMemo(() => result ? JSON.stringify({ mod: result.modName, target: result.target, tuning: Object.fromEntries(result.controls.map((c) => [c.key, c.value])) }, null, 2) : '', [result]);

  return <div className="container">
    <header className="header-card">
      <div className="brand-row"><span className="tag green">GENERATED MOD RESULT</span><span className="tag violet">OPTIONAL CREATOR CONTROLS</span></div>
      <h1 className="header-title">Creator Controls Prototype</h1>
      <p className="meta">A post-generation tuning layer for CreativeMode-style Minecraft mods.</p>
    </header>

    <section>
      <div className="section-heading"><h2>Soul Reaper Kyoraku Blade</h2><span className="tag">Target: Fabric 1.21.5</span></div>
      <p className="meta">Generated output preview (source-like text):</p>
      <pre>{generatedOutput}</pre>
      <div className="yaml-actions">
        <button className="secondary">Download Generated JAR (Mock)</button>
        <button onClick={() => setResult(analyzeGeneratedMod(generatedOutput))}>Add Creator Controls</button>
      </div>
    </section>

    {result && <>
      <section>
        <div className="section-heading"><h2>Detected Mod Profile</h2></div>
        <p><b>Primary Content Type:</b> {result.primaryContentType} &nbsp; <b>Confidence:</b> {(result.confidence*100).toFixed(0)}%</p>
        <p><b>Detected Mechanics:</b> {result.detectedMechanics.join(', ')}</p>
      </section>

      <section>
        <div className="section-heading"><h2>Creator Controls</h2></div>
        {categories.map((cat) => grouped[cat]?.length ? <div className="category-block" key={cat}><h3>{cat}</h3>
          {grouped[cat].map((control) => <div className="setting" key={control.key}>
            <div className="setting-head"><label>{control.label}</label><span className={`risk ${control.risk}`}>{control.risk.toUpperCase()}</span></div>
            {control.input === 'slider' && <input type="range" min={control.min} max={control.max} step={control.step ?? 1} value={Number(control.value)} onChange={(e) => updateControl(control.key, Number(e.target.value))} />}
            {control.input === 'number' && <input type="number" min={control.min} max={control.max} value={Number(control.value)} onChange={(e) => updateControl(control.key, Number(e.target.value))} />}
            {control.input === 'toggle' && <input type="checkbox" checked={Boolean(control.value)} onChange={(e) => updateControl(control.key, e.target.checked)} />}
            {control.input === 'select' && <select value={String(control.value)} onChange={(e) => updateControl(control.key, e.target.value)}>{control.options?.map((o) => <option value={o} key={o}>{o}</option>)}</select>}
            {control.input === 'tags' && <input value={(control.value as string[]).join(', ')} onChange={(e) => updateControl(control.key, e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} />}
            <small>{control.reason} • {control.source === 'explicit' ? 'Explicitly detected' : 'Inferred'}</small>
          </div>)}
        </div> : null)}
      </section>

      <section>
        <div className="section-heading"><h2>Tuning Previews</h2></div>
        <p className="meta">Creator Controls schema preview (JSON)</p>
        <pre>{schemaPreview}</pre>
        <p className="meta">Fabric-style config preview (JSON)</p>
        <pre>{configPreview}</pre>
        <p className="meta">Before / After Java snippet preview</p>
        <pre>{`// BEFORE (generated hardcoded values)\nfloat bankaiDamageBonus = 14f;\nint transformationCooldownSeconds = 18;\nif (bankaiMode) applyAoE(7, 5);\n\n// AFTER (post-generation Creator Controls layer)\nfloat bankaiDamageBonus = CreatorControls.getFloat("bankai_damage_bonus");\nint transformationCooldownSeconds = ModConfig.getInt("transformation_cooldown_seconds");\nif (ModConfig.getBoolean("bankai_mode_enabled")) applyAoE(ModConfig.getInt("aoe_radius"), ModConfig.getInt("max_affected_targets"));`}</pre>
      </section>

      <section>
        <div className="section-heading"><h2>Implementation Notes</h2></div>
        <ul>
          <li>This prototype demonstrates a post-generation refactor/tuning layer for generated mods.</li>
          <li>Users adjust values through no-code controls in UI, not by manually editing raw code files.</li>
          <li>This frontend prototype does not compile real JARs.</li>
          <li>In production, full tuned JAR rebuild happens in CreativeMode’s existing generation/build pipeline.</li>
        </ul>
        <div className="yaml-actions"><button>Download Tuned Package (Mock)</button></div>
      </section>
    </>}
  </div>;
}
