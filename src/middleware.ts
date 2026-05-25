export { default } from "next-auth/middleware";

export const config = {
  // Protect all /admin routes EXCEPT /admin/login.
  matcher: ["/admin", "/admin/((?!login).*)"],
};
