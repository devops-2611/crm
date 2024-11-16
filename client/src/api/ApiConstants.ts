
const ApiConstants = {

  //POST API
  REGISTER_USER: () => `/api/auth/register`,
  LOGIN_USER: () => `/api/auth/login`,
  UPLOAD_CSV: () => `/api/invoice/uploadAndGetInvoiceData`,

  
  //GET API
  CHECK_AUTH : () => `/api/auth/checkAuth`,
  GET_ALL_USERS : () => `/api/auth/getAllUsers`,
  


  //PUT API

  //DELETE API

};

export default ApiConstants;