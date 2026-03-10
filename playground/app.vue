<template>
  <div style="font-family: system-ui, sans-serif; max-width: 960px; margin: 0 auto; padding: 2rem;">
    <h1>🪵 nuxt-log-utils Playground</h1>
    <nav style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/levels">Levels</NuxtLink>
      <NuxtLink to="/masking">Masking</NuxtLink>
      <NuxtLink to="/hooks">Hooks</NuxtLink>
      <NuxtLink to="/named">Named Loggers</NuxtLink>
      <NuxtLink to="/server-test">Server Test</NuxtLink>
    </nav>
    <hr>
    <NuxtPage />
  </div>
</template>
