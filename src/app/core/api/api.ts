export const API_BASE_URL = 'http://75.119.129.108:7070';

export interface ApiResponse<T = null> {
  success: boolean;
  message: string | null;
  data: T;
}
