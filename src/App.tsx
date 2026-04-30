import { useMemo, useState } from 'react';

type ContentType = 'weapon' | 'armor' | 'tool' | 'item' | 'mob/boss' | 'block' | 'dimension' | 'structure' | 'economy system' | 'command system';
type ControlCategory = 'Gameplay' | 'Combat' | 'Effects' | 'Visuals & Sounds' | 'Multiplayer Safety' | 'Advanced';
type ControlInput = 'slider' | 'toggle' | 'select' | 'number' | 'tags';

type CreatorControl = { key: string; label: string; category: ControlCategory; input: ControlInput; value: number | boolean | string | string[]; unit?: string; min?: number; max?: number; step?: number; options?: string[]; risk: 'low'|'medium'|'high'; source: 'explicit'|'inferred'; reason: string; };
type AnalyzerResult = { modName: string; target: string; primaryContentType: ContentType; detectedMechanics: string[]; confidence: number; controls: CreatorControl[]; };

const sample = `Mod Name: Soul Reaper Kyoraku Blade\nTarget: Fabric 1.21.5\nGenerated Result: Playable Fabric mod jar for custom katana item with three transformation modes.\nModes: Sealed, Shikai, Bankai.\nSealed mode adds +4 damage.\nShikai mode adds +9 damage and inflicts weakness for 6 seconds (amplifier 1).\nBankai mode adds +14 damage and inflicts blindness and slowness for 4 seconds (amplifier 2).\nTransformation cooldown: 18 seconds.\nBankai slash emits void wave with 7 block AoE radius, max 5 affected targets.\nParticles: crimson aura intensity 70.\nSounds: slash and transform sounds enabled.\nPvP compatibility enabled in combat worlds.\nDisabled worlds: lobby, spawn.`;

const getNum = (s: string, r: RegExp) => Number(s.match(r)?.[1] ?? NaN);
const categories: ControlCategory[] = ['Gameplay','Combat','Effects','Visuals & Sounds','Multiplayer Safety','Advanced'];

function analyzeGeneratedMod(text: string): AnalyzerResult {
  const s = text.toLowerCase();
  const primary: ContentType = /weapon|blade|katana|sword/.test(s) ? 'weapon' : /boss|mob/.test(s) ? 'mob/boss' : 'item';
  const mechanics = ['combat','status effects','transformation modes','particles','sounds','aoe','cooldowns'].filter((m)=>
    ({combat:/damage|combat/, 'status effects':/weakness|blindness|slowness/, 'transformation modes':/sealed|shikai|bankai|transform/, particles:/particle|aura/, sounds:/sound/, aoe:/aoe|radius/, cooldowns:/cooldown/}[m] as RegExp).test(s));
  const controls: CreatorControl[] = primary === 'weapon' ? [
    { key:'sealed_damage_bonus',label:'Sealed Damage Bonus',category:'Combat',input:'slider',value:getNum(s,/sealed mode adds \+(\d+)/)||4,unit:'',min:0,max:20,step:1,risk:'medium',source:'explicit',reason:'Fine-tune base form power.'},
    { key:'shikai_damage_bonus',label:'Shikai Damage Bonus',category:'Combat',input:'slider',value:getNum(s,/shikai mode adds \+(\d+)/)||9,min:0,max:30,step:1,risk:'high',source:'explicit',reason:'Major PvP balance lever.'},
    { key:'bankai_damage_bonus',label:'Bankai Damage Bonus',category:'Combat',input:'slider',value:getNum(s,/bankai mode adds \+(\d+)/)||14,min:0,max:40,step:1,risk:'high',source:'explicit',reason:'Peak mode burst control.'},
    { key:'transformation_cooldown_seconds',label:'Transformation Cooldown',category:'Gameplay',input:'slider',value:getNum(s,/cooldown:\s*(\d+)/)||18,unit:'s',min:1,max:90,step:1,risk:'medium',source:'explicit',reason:'Limits rapid mode switching.'},
    { key:'aoe_radius',label:'AoE Radius',category:'Effects',input:'slider',value:getNum(s,/(\d+)\s*block\s*aoe\s*radius/)||7,unit:'blocks',min:1,max:16,step:1,risk:'high',source:'explicit',reason:'Controls crowd pressure.'},
    { key:'max_affected_targets',label:'Max Affected Targets',category:'Multiplayer Safety',input:'number',value:getNum(s,/max\s*(\d+)\s*affected\s*targets/)||5,min:1,max:20,unit:'targets',risk:'high',source:'explicit',reason:'Caps chain-hit load.'},
    { key:'effect_duration_seconds',label:'Effect Duration',category:'Effects',input:'slider',value:6,unit:'s',min:0,max:20,step:1,risk:'high',source:'explicit',reason:'Status fairness control.'},
    { key:'effect_amplifier',label:'Effect Amplifier Level',category:'Effects',input:'select',value:'1',options:['0','1','2','3'],risk:'high',source:'explicit',reason:'Amplifier impacts fairness.'},
    { key:'particle_intensity',label:'Particle Intensity',category:'Visuals & Sounds',input:'slider',value:getNum(s,/intensity\s*(\d+)/)||70,unit:'%',min:0,max:100,step:1,risk:'medium',source:'explicit',reason:'Performance and readability tuning.'},
    { key:'sound_effects_enabled',label:'Sound Effects Enabled',category:'Visuals & Sounds',input:'toggle',value:true,risk:'low',source:'explicit',reason:'Audio preference control.'},
    { key:'pvp_enabled',label:'PvP Enabled',category:'Multiplayer Safety',input:'toggle',value:true,risk:'high',source:'explicit',reason:'Server ruleset safety control.'},
    { key:'disabled_worlds',label:'Disabled Worlds',category:'Multiplayer Safety',input:'tags',value:['lobby','spawn'],risk:'medium',source:'explicit',reason:'Protects non-combat worlds.'},
    { key:'sealed_mode_enabled',label:'Sealed Mode Enabled',category:'Advanced',input:'toggle',value:true,risk:'low',source:'inferred',reason:'Mode feature flag.'},
    { key:'shikai_mode_enabled',label:'Shikai Mode Enabled',category:'Advanced',input:'toggle',value:true,risk:'medium',source:'inferred',reason:'Seasonal tuning switch.'},
    { key:'bankai_mode_enabled',label:'Bankai Mode Enabled',category:'Advanced',input:'toggle',value:true,risk:'high',source:'inferred',reason:'High-power mode switch.'}
  ] : [];
  return { modName:'Soul Reaper Kyoraku Blade', target:'Fabric 1.21.5', primaryContentType:primary, detectedMechanics:mechanics, confidence:0.92, controls };
}

export default function App(){
  const [result,setResult]=useState<AnalyzerResult|null>(null);
  const [open,setOpen]=useState({schema:true,config:false,java:false,changes:true});
  const grouped = useMemo(()=>result?result.controls.reduce((a,c)=>{a[c.category]=[...(a[c.category]??[]),c];return a;},{} as Record<ControlCategory,CreatorControl[]>):{} as Record<ControlCategory,CreatorControl[]>,[result]);
  const update=(k:string,v:CreatorControl['value'])=>setResult(p=>p?{...p,controls:p.controls.map(c=>c.key===k?{...c,value:v}:c)}:p);
  const schema=useMemo(()=>result?JSON.stringify({creatorControls:result.controls},null,2):'',[result]);
  const config=useMemo(()=>result?JSON.stringify({mod:result.modName,target:result.target,tuning:Object.fromEntries(result.controls.map(c=>[c.key,c.value]))},null,2):'',[result]);

  return <div className="container">
    <header className="header-card"><div className="brand-row"><span className="tag green">GENERATED MOD RESULT</span><span className="tag violet">CREATOR CONTROLS</span></div><h1 className="header-title">Creator Controls Prototype</h1><p className="meta">A post-generation tuning layer for CreativeMode-style Minecraft mods.</p></header>
    <section>
      <div className="section-heading"><h2>Soul Reaper Kyoraku Blade</h2><span className="tag">Target: Fabric 1.21.5</span></div>
      <pre>{sample}</pre>
      <div className="yaml-actions"><button className="secondary">Download Generated JAR (Mock)</button><button onClick={()=>setResult(analyzeGeneratedMod(sample))}>Add Creator Controls</button></div>
    </section>

    {result && <>
      <section><p><b>Primary Content Type:</b> {result.primaryContentType} <b>Confidence:</b> {(result.confidence*100).toFixed(0)}%</p><p><b>Detected Mechanics:</b> {result.detectedMechanics.join(', ')}</p></section>
      <section><div className="section-heading"><h2>Creator Controls</h2></div>
        {categories.map(cat=>grouped[cat]?.length?<div key={cat} className="category-block"><h3>{cat}</h3>{grouped[cat].map(c=>{
          const valueLabel = Array.isArray(c.value)?c.value.join(', '):typeof c.value==='boolean'?(c.value?'Enabled':'Disabled'):`${c.value}${c.unit?` ${c.unit}`:''}`;
          return <div key={c.key} className="control-row"><div className="setting-head"><label>{c.label}: <span className="value-live">{valueLabel}</span></label><span className={`risk ${c.risk}`}>{c.risk.toUpperCase()}</span></div>
            {c.input==='slider'&&<input className="slider" type="range" min={c.min} max={c.max} step={c.step??1} value={Number(c.value)} onChange={e=>update(c.key,Number(e.target.value))}/>}
            {c.input==='number'&&<input type="number" min={c.min} max={c.max} value={Number(c.value)} onChange={e=>update(c.key,Number(e.target.value))}/>}
            {c.input==='toggle'&&<input type="checkbox" checked={Boolean(c.value)} onChange={e=>update(c.key,e.target.checked)}/>}
            {c.input==='select'&&<select value={String(c.value)} onChange={e=>update(c.key,e.target.value)}>{c.options?.map(o=><option key={o} value={o}>{o}</option>)}</select>}
            {c.input==='tags'&&<input value={(c.value as string[]).join(', ')} onChange={e=>update(c.key,e.target.value.split(',').map(x=>x.trim()).filter(Boolean))}/>}
            <div className="control-meta"><span>{c.reason}</span><span className="tag">{c.source==='explicit'?'Explicit':'Inferred'}</span></div></div>;
        })}</div>:null)}
      </section>

      <section><div className="collapse-head" onClick={()=>setOpen(v=>({...v,changes:!v.changes}))}><h3>What changed</h3><button className="secondary">{open.changes?'Hide':'Show'}</button></div>{open.changes&&<pre>{`Hardcoded generated values are now mapped to Creator Controls keys for live tuning through UI.`}</pre>}</section>
      <section><div className="collapse-head" onClick={()=>setOpen(v=>({...v,schema:!v.schema}))}><h3>Creator Controls Preview (JSON)</h3><button className="secondary">{open.schema?'Hide':'Show'}</button></div>{open.schema&&<pre>{schema}</pre>}</section>
      <section><div className="collapse-head" onClick={()=>setOpen(v=>({...v,config:!v.config}))}><h3>Tuning Preview (Fabric-style JSON)</h3><button className="secondary">{open.config?'Hide':'Show'}</button></div>{open.config&&<pre>{config}</pre>}</section>
      <section><div className="collapse-head" onClick={()=>setOpen(v=>({...v,java:!v.java}))}><h3>Before / After Java Preview</h3><button className="secondary">{open.java?'Hide':'Show'}</button></div>{open.java&&<pre>{`// BEFORE\nfloat bankaiDamageBonus = 14f;\nint transformationCooldownSeconds = 18;\n\n// AFTER\nfloat bankaiDamageBonus = CreatorControls.getFloat("bankai_damage_bonus");\nint transformationCooldownSeconds = ModConfig.getInt("transformation_cooldown_seconds");`}</pre>}</section>
      <section><h3>Implementation Notes</h3><div className="note-row">Creator Controls lets users tune a generated mod after it is created.</div><div className="note-row">Small changes like damage, cooldowns, particles, and effect durations can be adjusted through the website instead of another prompt.</div><div className="note-row">This prototype shows the UI and refactor concept. It does not compile a real JAR.</div><div className="note-row">In production, CreativeMode’s existing build pipeline would generate the updated tuned JAR.</div><div className="yaml-actions"><button>Export Tuned JAR (Prototype)</button></div><small className="meta">Prototype export only — no real compilation in this frontend demo.</small></section>
    </>}
  </div>
}
