import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export default handleAuth({
  signUp: handleLogin({ authorizationParams: { screen_hint: "signup" } }),
});
