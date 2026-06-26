<script setup lang="ts"></script>

<template>
  <div class="app-layout">
    <header class="app-header no-print">
      <div class="header-inner">
        <RouterLink to="/" class="app-title">
          <span class="app-title-mark">EA</span>
          <span class="app-title-text">Army Builder</span>
        </RouterLink>
        <nav class="header-nav desktop-only">
          <RouterLink to="/">Lists</RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <nav class="bottom-nav mobile-only no-print">
      <RouterLink to="/" class="bottom-nav-item">
        <span>Lists</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-header {
  height: 3.5rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: var(--ea-header-bg);
  border-bottom: 1px solid var(--ea-header-border);
}

.header-inner {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
}

.app-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ea-header-fg);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.app-title:hover {
  text-decoration: none;
}

.app-title-mark {
  width: 28px;
  height: 28px;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.header-nav a {
  color: var(--ea-header-fg-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.3rem 0.5rem;
  border-radius: var(--ea-radius-md);
}

.header-nav a:hover,
.header-nav a.router-link-active {
  color: var(--ea-header-fg);
  text-decoration: none;
}

.app-main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: calc(1rem + 4rem);
}

@media (min-width: 768px) {
  .app-main {
    padding-bottom: 1rem;
  }
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background: var(--ea-surface-card);
  border-top: 1px solid var(--ea-surface-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.7rem;
  text-decoration: none;
  color: var(--ea-text-muted-color);
  padding: 0.5rem 1rem;
}

.bottom-nav-item.router-link-active {
  color: var(--ea-accent);
}

.desktop-only {
  display: none;
}

.mobile-only {
  display: flex;
}

@media (min-width: 768px) {
  .desktop-only {
    display: flex;
  }
  .mobile-only {
    display: none;
  }
}
</style>
