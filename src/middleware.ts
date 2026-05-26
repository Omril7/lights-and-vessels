export { default } from "next-auth/middleware";

export const config = {
  // Protect all /admin routes EXCEPT /admin/login, and gate the PWA manifest.
  matcher: ["/admin", "/admin/((?!login).*)", "/manifest.webmanifest"],
};
