export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export class ApiResponse {
  static success<T>(
    data: T,
    message?: string,
    pagination?: ApiSuccessResponse<T>['pagination']
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      ...(message && { message }),
      data,
      ...(pagination && { pagination }),
    };
  }

  static error(message: string, code?: string, details?: unknown): ApiErrorResponse {
    const errorPayload: ApiErrorResponse['error'] = { message };
    if (code) errorPayload.code = code;
    if (details !== undefined) errorPayload.details = details;
    return {
      success: false,
      error: errorPayload,
    };
  }
}
