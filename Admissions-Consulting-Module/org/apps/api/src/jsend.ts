
type SuccessResponse<T> = {
  status: 'success';
  data: T;
};


type FailResponse<T = undefined> = {
  status: 'fail';
  message: string;
  data?: T; // data is optional
};


type ErrorResponse<T = undefined> = {
  status: 'error';
  message: string;
  data?: T; // data is optional
};


function success<T>(data: T | null = null, p0?: string): SuccessResponse<T | null> {
  return {
    status: 'success',
    data: data,
  };
}


function fail<T>(message: string, data: T | null = null): FailResponse<T | undefined> {
  if (data !== null) {
    return {
      status: 'fail',
      message,
      data: data,
    };
  }
  return {
    status: 'fail',
    message,
  };
}


function error<T>(message: string, data: T | null = null): ErrorResponse<T | undefined> {
  if (data !== null) {
    return {
      status: 'error',
      message,
      data,
    };
  };
  return {
    status: 'error',
    message,
  };
}


export default {
  success,
  fail,
  error,
};

