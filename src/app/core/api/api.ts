export const API_BASE_URL = 'http://localhost:5062';

export interface ApiResponse<T = null> {
  success: boolean;
  message: string | null;
  data: T;
}
