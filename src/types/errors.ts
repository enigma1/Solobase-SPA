export type ApiError = Error & {
  error: string;
  message: string;
  details?: string[];
};

export type LocalErrorTypes = 'resource';
export type LocalError = ApiError & {
  error: LocalErrorTypes;
  message: string;
  details?: string[];
};
