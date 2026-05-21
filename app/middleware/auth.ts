export default defineNuxtRouteMiddleware((to) => {
  const token = import.meta.client ? localStorage.getItem('auth_token') : null

  if (!token && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (token && to.path === '/login') {
    return navigateTo('/chat')
  }
})
