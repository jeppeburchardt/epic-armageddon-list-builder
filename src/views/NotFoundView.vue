<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
</script>

<template>
  <div class="not-found-view">
    <div class="not-found-content">
      <h1 class="not-found-title">404 Not found</h1>
      <RouterLink to="/" class="home-link">
        <Button label="Go to Lists" icon="pi pi-home" />
      </RouterLink>
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
  color: var(--p-text-color);
}

.home-link {
  text-decoration: none;
}
</style>
