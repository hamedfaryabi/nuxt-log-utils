export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('[nuxt-log] API transport received:', JSON.stringify(body, null, 2))
  return { ok: true, received: true }
})
