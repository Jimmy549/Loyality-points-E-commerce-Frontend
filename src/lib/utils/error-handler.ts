export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export class ErrorHandler {
  static handleApiError(error: any): ApiError {
    // Handle network errors
    if (!error.response) {
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
        error: 'NetworkError'
      };
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          message: data?.message || 'Invalid request. Please check your input.',
          statusCode: 400,
          error: 'BadRequest'
        };
      case 401:
        return {
          message: 'Authentication required. Please log in.',
          statusCode: 401,
          error: 'Unauthorized'
        };
      case 403:
        return {
          message: 'Access denied. You don\'t have permission to perform this action.',
          statusCode: 403,
          error: 'Forbidden'
        };
      case 404:
        return {
          message: 'Resource not found.',
          statusCode: 404,
          error: 'NotFound'
        };
      case 409:
        return {
          message: data?.message || 'Conflict. Resource already exists.',
          statusCode: 409,
          error: 'Conflict'
        };
      case 422:
        return {
          message: data?.message || 'Validation failed. Please check your input.',
          statusCode: 422,
          error: 'ValidationError'
        };
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          statusCode: 429,
          error: 'TooManyRequests'
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          statusCode: 500,
          error: 'InternalServerError'
        };
      default:
        return {
          message: data?.message || 'An unexpected error occurred.',
          statusCode: status,
          error: 'UnknownError'
        };
    }
  }

  static isAuthError(error: ApiError): boolean {
    return error.statusCode === 401 || error.statusCode === 403;
  }

  static isNetworkError(error: ApiError): boolean {
    return error.statusCode === 0;
  }

  static isValidationError(error: ApiError): boolean {
    return error.statusCode === 400 || error.statusCode === 422;
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    const apiError = this.handleApiError(error);
    return apiError.message;
  }
}