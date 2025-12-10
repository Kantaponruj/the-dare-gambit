import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { login, setToken, clearToken } from "./apiClient";

interface Vars {
  username: string;
  password: string;
}

export function useLoginMutation(
  options?: UseMutationOptions<{ token: string }, Error, Vars>
) {
  return useMutation<{ token: string }, Error, Vars>({
    mutationKey: ["login"],
    mutationFn: async (vars) => {
      const res = await login(vars.username, vars.password);
      setToken(res.token);
      return res;
    },
    ...options,
  });
}

export function useLogoutMutation(
  options?: UseMutationOptions<void, Error, void>
) {
  return useMutation<void, Error, void>({
    mutationKey: ["logout"],
    mutationFn: async () => {
      clearToken();
      localStorage.removeItem("auth.loggedIn");
    },
    ...options,
  });
}
