<template>
  <div class="app-layout">
    <!-- Top nav bar -->
    <header class="app-header no-print">
      <div class="header-inner">
        <RouterLink to="/" class="app-title">EA Army Builder</RouterLink>
        <nav class="header-nav desktop-only">
          <RouterLink to="/">Lists</RouterLink>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="app-main">
      <slot />
    </main>

    <!-- Bottom nav (mobile) -->
    <nav class="bottom-nav mobile-only no-print">
      <RouterLink to="/" class="bottom-nav-item">
        <span class="pi pi-list" />
        <span>Lists</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-header {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  padding: 0 1rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,.2);
}

.header-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.app-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
  letter-spacing: .02em;
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.header-nav a {
  color: inherit;
  text-decoration: none;
  opacity: .85;
  font-size: .9rem;
}

.header-nav a:hover,
.header-nav a.router-link-active {
  opacity: 1;
}

.app-main {
  flex: 1;
  padding: 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  /* Room for bottom nav on mobile */
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
  background: var(--p-surface-card);
  border-top: 1px solid var(--p-surface-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .2rem;
  font-size: .7rem;
  text-decoration: none;
  color: var(--p-text-muted-color);
  padding: .5rem 1rem;
}

.bottom-nav-item.router-link-active {
  color: var(--p-primary-color);
}

.bottom-nav-item .pi {
  font-size: 1.2rem;
}

/* Responsive helpers */
.desktop-only {
  display: none;
}

.mobile-only {
  display: flex;
}

@media (min-width: 768px) {
  .desktop-only { display: flex; }
  .mobile-only { display: none; }
}
</style>
