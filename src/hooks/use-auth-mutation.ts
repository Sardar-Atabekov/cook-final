import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

type SignupPayload = { name: string; email: string; password: string };
type LoginPayload = { email: string; password: string };
type GoogleAuthPayload = { code: string };

export function useSignupMutation() {
  return useMutation({
    mutationFn: ({ name, email, password }: SignupPayload) =>
      authApi.signup(email, password, name),
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: LoginPayload) =>
      authApi.login(email, password),
  });
}

export function useGoogleAuthMutation() {
  return useMutation({
    mutationFn: ({ code }: GoogleAuthPayload) => authApi.googleAuth(code),
  });
}
