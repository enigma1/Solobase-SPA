export type ApiError = Error & {
  status: string;
  error: string;
  message: string;
};
