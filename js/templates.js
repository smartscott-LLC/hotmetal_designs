/* ============================================================
   SmarTools HTML Studio — HTML Templates
   Starter templates for common page types.
   Each template has: id, label, description, icon, category,
   and code/css/js strings.
   ============================================================ */

export const TEMPLATES = [
  /* ── Blank ──────────────────────────────────────────────── */
  {
    id: 'blank',
    label: 'Blank Page',
    description: 'Empty HTML5 boilerplate',
    icon: '📄',
    category: 'basic',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Untitled</title>
</head>
<body>

  <h1>Hello World</h1>
  <p>Start building something amazing.</p>

</body>
</html>`,
    css: '',
    js: '',
  },

  /* ── Landing Page ────────────────────────────────────────── */
  {
    id: 'landing',
    label: 'Landing Page',
    description: 'Hero section with CTA, features, and footer',
    icon: '🚀',
    category: 'pages',
    code: `<header>
  <nav>
    <div class="logo">Brand</div>
    <ul class="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main>
  <section class="hero">
    <h1>Build Something Amazing</h1>
    <p>A modern landing page template to showcase your product or service.</p>
    <a href="#features" class="cta-btn">Get Started</a>
  </section>

  <section id="features" class="features">
    <h2>Features</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>⚡ Fast</h3>
        <p>Lightning-fast performance out of the box.</p>
      </div>
      <div class="feature-card">
        <h3>🎨 Beautiful</h3>
        <p>Clean, modern design that looks great everywhere.</p>
      </div>
      <div class="feature-card">
        <h3>🔒 Secure</h3>
        <p>Built with security best practices in mind.</p>
      </div>
    </div>
  </section>
</main>

<footer>
  <p>&copy; 2026 Brand. All rights reserved.</p>
</footer>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }

header { background: #1a1a1a; padding: 1rem 2rem; }
nav { display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin: 0 auto; }
.logo { color: #d4a843; font-size: 1.4rem; font-weight: 700; }
.nav-links { display: flex; list-style: none; gap: 2rem; }
.nav-links a { color: #c0c0c0; text-decoration: none; transition: color .2s; }
.nav-links a:hover { color: #d4a843; }

.hero { text-align: center; padding: 6rem 2rem; background: linear-gradient(135deg, #1a1a1a, #2a2a2e); color: #e8e8e8; }
.hero h1 { font-size: 3rem; margin-bottom: 1rem; }
.hero p { font-size: 1.2rem; color: #c0c0c0; margin-bottom: 2rem; }
.cta-btn { display: inline-block; padding: 12px 32px; background: #b8860b; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 1rem; transition: background .2s; }
.cta-btn:hover { background: #d4a843; }

.features { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; }
.features h2 { text-align: center; font-size: 2rem; margin-bottom: 2rem; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.feature-card { padding: 2rem; border: 1px solid #ddd; border-radius: 8px; transition: box-shadow .2s; }
.feature-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.1); }
.feature-card h3 { margin-bottom: .5rem; }

footer { text-align: center; padding: 2rem; background: #1a1a1a; color: #888; }`,
    js: '',
  },

  /* ── Dashboard ──────────────────────────────────────────── */
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Admin dashboard with sidebar, stats, and table',
    icon: '📊',
    category: 'pages',
    code: `<div class="dashboard">
  <aside class="sidebar">
    <div class="sidebar-brand">Dashboard</div>
    <nav class="sidebar-nav">
      <a href="#" class="active">📊 Overview</a>
      <a href="#">📈 Analytics</a>
      <a href="#">👥 Users</a>
      <a href="#">⚙️ Settings</a>
    </nav>
  </aside>

  <main class="content">
    <header class="content-header">
      <h1>Overview</h1>
      <div class="header-actions">
        <button class="btn">+ New</button>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Users</div>
        <div class="stat-value">12,847</div>
        <div class="stat-change up">↑ 12%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Revenue</div>
        <div class="stat-value">$48,290</div>
        <div class="stat-change up">↑ 8%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Orders</div>
        <div class="stat-value">1,429</div>
        <div class="stat-change down">↓ 3%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Conversion</div>
        <div class="stat-value">3.24%</div>
        <div class="stat-change up">↑ 0.4%</div>
      </div>
    </div>

    <div class="card">
      <h2>Recent Activity</h2>
      <table>
        <thead><tr><th>User</th><th>Action</th><th>Time</th></tr></thead>
        <tbody>
          <tr><td>Alice</td><td>Created a new project</td><td>2 min ago</td></tr>
          <tr><td>Bob</td><td>Updated settings</td><td>15 min ago</td></tr>
          <tr><td>Carol</td><td>Uploaded a file</td><td>1 hr ago</td></tr>
          <tr><td>Dave</td><td>Invited a team member</td><td>3 hr ago</td></tr>
        </tbody>
      </table>
    </div>
  </main>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #f0f0f0; }

.dashboard { display: flex; min-height: 100vh; }

.sidebar { width: 220px; background: #1a1a1a; color: #c0c0c0; padding: 1.5rem 0; flex-shrink: 0; }
.sidebar-brand { font-size: 1.2rem; font-weight: 700; color: #d4a843; padding: 0 1.5rem 1.5rem; }
.sidebar-nav a { display: block; padding: 10px 1.5rem; color: #c0c0c0; text-decoration: none; transition: all .2s; }
.sidebar-nav a:hover, .sidebar-nav a.active { background: rgba(255,255,255,.08); color: #d4a843; }

.content { flex: 1; padding: 2rem; overflow-y: auto; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.content-header h1 { font-size: 1.6rem; }
.btn { padding: 8px 18px; background: #b8860b; color: #1a1a1a; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn:hover { background: #d4a843; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.stat-label { font-size: .85rem; color: #888; margin-bottom: .25rem; }
.stat-value { font-size: 1.8rem; font-weight: 700; }
.stat-change { font-size: .85rem; margin-top: .25rem; }
.stat-change.up { color: #27ae60; }
.stat-change.down { color: #c0392b; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.08); padding: 1.5rem; }
.card h2 { font-size: 1.1rem; margin-bottom: 1rem; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px 0; border-bottom: 1px solid #eee; }
th { color: #888; font-weight: 600; font-size: .85rem; }`,
    js: '',
  },

  /* ── Contact Form ───────────────────────────────────────── */
  {
    id: 'contact',
    label: 'Contact Form',
    description: 'Styled contact form with validation',
    icon: '✉️',
    category: 'forms',
    code: `<div class="form-container">
  <h1>Get in Touch</h1>
  <p>We'd love to hear from you. Send us a message.</p>

  <form id="contact-form">
    <div class="form-row">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" placeholder="Your name" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="you@example.com" required />
      </div>
    </div>

    <div class="form-group">
      <label for="subject">Subject</label>
      <select id="subject" name="subject">
        <option value="">Select a topic…</option>
        <option value="general">General Inquiry</option>
        <option value="support">Support</option>
        <option value="feedback">Feedback</option>
      </select>
    </div>

    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" name="message" rows="5" placeholder="Your message…" required></textarea>
    </div>

    <button type="submit" class="submit-btn">Send Message</button>
  </form>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }

.form-container { background: #fff; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,.1); width: 100%; max-width: 520px; }
.form-container h1 { font-size: 1.8rem; margin-bottom: .5rem; }
.form-container p { color: #888; margin-bottom: 2rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: .85rem; font-weight: 600; margin-bottom: .4rem; color: #555; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: inherit; transition: border-color .2s; outline: none; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #b8860b; }
.form-group textarea { resize: vertical; }

.submit-btn { width: 100%; padding: 12px; background: #b8860b; color: #1a1a1a; border: none; border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background .2s; }
.submit-btn:hover { background: #d4a843; }`,
    js: `document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thanks for your message! (This is a demo)');
});`,
  },

  /* ── Portfolio ──────────────────────────────────────────── */
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Personal portfolio with projects grid',
    icon: '🎨',
    category: 'pages',
    code: `<header class="site-header">
  <div class="logo">JD</div>
  <nav>
    <a href="#about">About</a>
    <a href="#work">Work</a>
    <a href="#contact">Contact</a>
  </nav>
</header>

<section class="hero-section">
  <h1>Jane Doe</h1>
  <p class="tagline">Designer & Developer crafting beautiful digital experiences</p>
  <a href="#work" class="btn-primary">View My Work</a>
</section>

<section id="work" class="projects-section">
  <h2>Selected Work</h2>
  <div class="project-grid">
    <div class="project-card">
      <div class="project-thumb" style="background:#1a1a1a;">🎵</div>
      <h3>Music App</h3>
      <p>Streaming platform redesign</p>
    </div>
    <div class="project-card">
      <div class="project-thumb" style="background:#4a4a5a;">📱</div>
      <h3>Mobile Dashboard</h3>
      <p>Analytics app for iOS</p>
    </div>
    <div class="project-card">
      <div class="project-thumb" style="background:#b8860b;">🛒</div>
      <h3>E-Commerce</h3>
      <p>Online store experience</p>
    </div>
    <div class="project-card">
      <div class="project-thumb" style="background:#c0c0c0;color:#1a1a1a;">📊</div>
      <h3>Data Viz</h3>
      <p>Interactive charts library</p>
    </div>
  </div>
</section>

<footer class="site-footer">
  <p>&copy; 2026 Jane Doe</p>
</footer>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }

.site-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 3rem; background: #1a1a1a; }
.logo { font-size: 1.5rem; font-weight: 700; color: #d4a843; }
.site-header nav { display: flex; gap: 2rem; }
.site-header nav a { color: #c0c0c0; text-decoration: none; transition: color .2s; }
.site-header nav a:hover { color: #d4a843; }

.hero-section { text-align: center; padding: 6rem 2rem; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2e 100%); color: #e8e8e8; }
.hero-section h1 { font-size: 3rem; margin-bottom: .5rem; }
.tagline { font-size: 1.2rem; color: #c0c0c0; margin-bottom: 2rem; }
.btn-primary { display: inline-block; padding: 12px 32px; background: #b8860b; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 700; transition: background .2s; }
.btn-primary:hover { background: #d4a843; }

.projects-section { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; }
.projects-section h2 { text-align: center; font-size: 2rem; margin-bottom: 2rem; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.project-card { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.08); transition: transform .2s; }
.project-card:hover { transform: translateY(-4px); }
.project-thumb { height: 160px; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
.project-card h3 { padding: 1rem 1rem .25rem; }
.project-card p { padding: 0 1rem 1rem; color: #888; font-size: .9rem; }

.site-footer { text-align: center; padding: 2rem; background: #1a1a1a; color: #888; }`,
    js: '',
  },

  /* ── Card Component ─────────────────────────────────────── */
  {
    id: 'card-component',
    label: 'Card Component',
    description: 'Reusable card with image, title, and action',
    icon: '🃏',
    category: 'components',
    code: `<div class="card">
  <div class="card-image">🖼️</div>
  <div class="card-body">
    <h3>Card Title</h3>
    <p>A versatile card component for displaying content with an image, text, and action button.</p>
    <button class="card-btn">Learn More</button>
  </div>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }

.card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.1); max-width: 360px; width: 100%; transition: transform .2s; }
.card:hover { transform: translateY(-4px); }
.card-image { height: 180px; background: linear-gradient(135deg, #1a1a1a, #4a4a5a); display: flex; align-items: center; justify-content: center; font-size: 4rem; }
.card-body { padding: 1.5rem; }
.card-body h3 { font-size: 1.3rem; margin-bottom: .5rem; }
.card-body p { color: #888; line-height: 1.6; margin-bottom: 1.25rem; }
.card-btn { padding: 8px 20px; background: #b8860b; color: #1a1a1a; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background .2s; }
.card-btn:hover { background: #d4a843; }`,
    js: '',
  },

  /* ── Navbar ─────────────────────────────────────────────── */
  {
    id: 'navbar',
    label: 'Navigation Bar',
    description: 'Responsive navbar with logo and links',
    icon: '🧭',
    category: 'components',
    code: `<nav class="navbar">
  <div class="nav-brand">Brand</div>
  <button class="nav-toggle" id="nav-toggle">☰</button>
  <ul class="nav-menu" id="nav-menu">
    <li><a href="#" class="active">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Services</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; }

.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #1a1a1a; }
.nav-brand { font-size: 1.4rem; font-weight: 700; color: #d4a843; }
.nav-menu { display: flex; list-style: none; gap: 2rem; }
.nav-menu a { color: #c0c0c0; text-decoration: none; padding: 4px 0; transition: color .2s; border-bottom: 2px solid transparent; }
.nav-menu a:hover, .nav-menu a.active { color: #d4a843; border-bottom-color: #d4a843; }
.nav-toggle { display: none; background: none; border: none; color: #c0c0c0; font-size: 1.5rem; cursor: pointer; }

@media (max-width: 768px) {
  .nav-toggle { display: block; }
  .nav-menu { display: none; position: absolute; top: 56px; left: 0; right: 0; background: #1a1a1a; flex-direction: column; padding: 1rem 2rem; gap: 1rem; }
  .nav-menu.open { display: flex; }
}`,
    js: `document.getElementById('nav-toggle').addEventListener('click', function() {
  document.getElementById('nav-menu').classList.toggle('open');
});`,
  },

  /* ── Pricing Table ──────────────────────────────────────── */
  {
    id: 'pricing',
    label: 'Pricing Table',
    description: 'Three-tier pricing comparison table',
    icon: '💰',
    category: 'components',
    code: `<div class="pricing-container">
  <h1>Simple Pricing</h1>
  <p>Choose the plan that works for you.</p>

  <div class="pricing-grid">
    <div class="pricing-card">
      <h3>Starter</h3>
      <div class="price"><span class="currency">$</span>9<span class="period">/mo</span></div>
      <ul class="features">
        <li>✓ 5 Projects</li>
        <li>✓ 1 GB Storage</li>
        <li>✓ Email Support</li>
      </ul>
      <button class="pricing-btn">Get Started</button>
    </div>

    <div class="pricing-card featured">
      <div class="badge">Popular</div>
      <h3>Pro</h3>
      <div class="price"><span class="currency">$</span>29<span class="period">/mo</span></div>
      <ul class="features">
        <li>✓ Unlimited Projects</li>
        <li>✓ 50 GB Storage</li>
        <li>✓ Priority Support</li>
        <li>✓ API Access</li>
      </ul>
      <button class="pricing-btn primary">Get Started</button>
    </div>

    <div class="pricing-card">
      <h3>Enterprise</h3>
      <div class="price"><span class="currency">$</span>99<span class="period">/mo</span></div>
      <ul class="features">
        <li>✓ Everything in Pro</li>
        <li>✓ 500 GB Storage</li>
        <li>✓ Dedicated Support</li>
        <li>✓ Custom Integrations</li>
      </ul>
      <button class="pricing-btn">Contact Sales</button>
    </div>
  </div>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #f5f5f5; }

.pricing-container { max-width: 960px; margin: 0 auto; padding: 4rem 2rem; text-align: center; }
.pricing-container h1 { font-size: 2.2rem; margin-bottom: .5rem; }
.pricing-container > p { color: #888; margin-bottom: 3rem; }

.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
.pricing-card { background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 12px rgba(0,0,0,.08); position: relative; transition: transform .2s; }
.pricing-card:hover { transform: translateY(-4px); }
.pricing-card.featured { border: 2px solid #b8860b; transform: scale(1.04); }
.pricing-card.featured:hover { transform: scale(1.04) translateY(-4px); }
.badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #b8860b; color: #1a1a1a; padding: 4px 16px; border-radius: 12px; font-size: .75rem; font-weight: 700; }
.pricing-card h3 { font-size: 1.2rem; margin-bottom: .5rem; }
.price { font-size: 2.5rem; font-weight: 700; margin: 1rem 0; }
.currency { font-size: 1.2rem; vertical-align: super; }
.period { font-size: 1rem; color: #888; font-weight: 400; }
.features { list-style: none; text-align: left; margin: 1.5rem 0; }
.features li { padding: 6px 0; color: #555; }
.pricing-btn { width: 100%; padding: 10px; border: 2px solid #b8860b; border-radius: 6px; background: transparent; color: #b8860b; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all .2s; }
.pricing-btn:hover { background: #b8860b; color: #1a1a1a; }
.pricing-btn.primary { background: #b8860b; color: #1a1a1a; }
.pricing-btn.primary:hover { background: #d4a843; border-color: #d4a843; }`,
    js: '',
  },
];
