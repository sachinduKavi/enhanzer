export const API_BASE_URL = 'http://127.0.0.1:7070';

export interface ApiResponse<T = null> {
  success: boolean;
  message: string | null;
  data: T;
}
