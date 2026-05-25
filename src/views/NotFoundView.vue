<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found-view">
    <div class="not-found-content">
      <h1 class="not-found-title">404 Not found</h1>
      <RouterLink to="/" class="home-link">Go to Lists</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.not-found-title {
  margin: 0;
  font-size: 2rem;
  color: var(--ea-text-color);
}

.home-link {
  text-decoration: none;
  border: 1px solid var(--ea-primary-color);
  background: var(--ea-primary-color);
  color: var(--ea-primary-contrast-color);
  border-radius: 0.375rem;
  padding: 0.45rem 0.75rem;
}
</style>
