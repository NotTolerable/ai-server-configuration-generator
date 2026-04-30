import './styles.css';

type TabKey = 'description' | 'versions' | 'comments';

function TopNav() {
  const navItems = ['Explore', 'ModJams', 'Create', 'Structures', 'My Mods', 'My Servers'];
  return (
    <nav className="top-nav">
      <div className="nav-left">
        <div className="logo">Creator Controls Demo</div>
        {navItems.map((item) => (
          <a key={item} className={`nav-item ${item === 'Structures' ? 'active' : ''}`} href="#">
            {item}
          </a>
        ))}
      </div>
      <div className="nav-right">
        <button className="community-btn">Join our community</button>
        <span className="pro-badge">PRO Unlimited Mods</span>
        <div className="avatar" aria-label="profile" />
      </div>
    </nav>
  );
}

function ModHeader() {
  return (
    <section className="mod-header">
      <div>
        <a className="back-link" href="#">◀ Back</a>
        <div className="pill-row">
          <span className="pill">v1</span>
          <span className="pill">MC Java 1.21.5</span>
        </div>
        <h1>Soul Reaper Kyoraku Blade</h1>
        <div className="meta-row">
          <span>↓ 1 download</span>
          <span className="tag">Combat</span>
          <span className="tag">Tool</span>
          <span className="tag">+ Add more</span>
          <span>◌ Unlisted</span>
        </div>
      </div>
      <div className="header-actions">
        <button className="icon-btn">⋮</button>
        <button className="icon-btn">⇩</button>
        <button className="action-btn">Share</button>
        <button className="action-btn">Publish</button>
        <button className="play-btn">▶ Play</button>
      </div>
    </section>
  );
}

function PreviewArea() {
  return (
    <section className="preview-area">
      <div className="sword-card">
        <div className="pixel-sword" />
      </div>
      <div className="recipe-preview-card">
        <div className="recipe-grid compact">
          {[...Array(9)].map((_, i) => <div key={i} className="cell" />)}
        </div>
        <span className="arrow">➜</span>
        <div className="result-cell" />
      </div>
    </section>
  );
}

function Tabs({ active }: { active: TabKey }) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'versions', label: 'Versions & Editing' },
    { key: 'comments', label: 'Comments' }
  ];
  return <div className="tabs">{tabs.map((tab) => <button key={tab.key} className={`tab ${active === tab.key ? 'active' : ''}`}>{tab.label}</button>)}</div>;
}

function EditPanel() {
  return (
    <section className="panel edit-panel">
      <h2>Edit this Mod</h2>
      <p>This will create a new mod based on "Soul Reaper Kyoraku Blade" with your modifications.</p>
      <textarea placeholder="Describe the changes you want to make..." rows={6} />
      <div className="edit-footer">
        <span className="advanced">NEW Advanced options (optional)</span>
        <button className="play-btn">Create New Version</button>
      </div>
    </section>
  );
}

function SidebarCards() {
  return (
    <aside className="sidebar">
      <section className="panel sidebar-card">
        <div className="recipe-grid">
          {[...Array(9)].map((_, i) => <div key={i} className="cell" />)}
        </div>
        <h3>Recipe</h3>
        <p>Visually edit crafting recipes for your custom items. This creates a new version with updated recipes.</p>
        <button className="purple-btn">Open Recipe Editor</button>
      </section>
      <section className="panel sidebar-card">
        <h3>Port this Mod</h3>
        <p>This will create a new version of "Soul Reaper Kyoraku Blade" for Minecraft Java 1.20.1. The original mod remains unchanged.</p>
        <button className="outline-btn">Port to Java 1.20.1</button>
      </section>
    </aside>
  );
}

function VersionHistory() {
  return (
    <section className="version-history">
      <h2>Version History</h2>
      <div className="history-tabs"><button className="tab active">Active</button><button className="tab">Discarded</button></div>
      <div className="panel version-card">
        <div className="version-top"><div><strong>v1</strong> <span className="status">Current</span> <span className="status complete">Complete</span></div><span>Apr 29, 2026, 12:22 AM  ↓ 1</span></div>
        <p><strong>User request:</strong> Create a new Minecraft weapon. Appearance: Create a soul reaper sword of Shunsui Kyoraku. Behavior: It should have a whole shikai and bankai.</p>
        <div className="feedback-row">
          <div><strong>Did you like this mod?</strong><br /><span className="muted">Help us improve Creator Controls with your feedback</span></div>
          <span>👍 👎</span>
        </div>
        <div className="feature-row"><strong>› Feature Implementation</strong><span>100% success rate</span></div>
      </div>
    </section>
  );
}

function TutorialToast() {
  return <div className="tutorial-toast"><div><h3>Get started</h3><p>Learn how to use Creator Controls</p></div><span>▾</span><div className="progress"><span /><span /><span /><span /><span /></div></div>;
}

export default function App() {
  return (
    <div className="app">
      <TopNav />
      <main className="layout">
        <ModHeader />
        <PreviewArea />
        <Tabs active="versions" />
        <div className="content-grid">
          <div>
            <EditPanel />
            <VersionHistory />
          </div>
          <SidebarCards />
        </div>
      </main>
      <TutorialToast />
    </div>
  );
}
