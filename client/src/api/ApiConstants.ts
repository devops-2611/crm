const ApiConstants = {
  //POST API
  REGISTER_USER: () => `/api/auth/register`,
  LOGIN_USER: () => `/api/auth/login`,
  UPLOAD_CSV: () => `/api/invoice/uploadAndGetInvoiceData`,
  UPLOAD_AND_GET_INVOICE_DATA: () => `/api/invoice/uploadAndGetInvoiceData`,
  SAVE_INVOICE_DATA: () => `/api/invoice/saveInvoiceData`,

  //GET API
  CHECK_AUTH: () => `/api/auth/checkAuth`,
  GET_ALL_USERS: () => `/api/auth/getAllUsers`,
  GET_ALL_CUSTOMERS: () => "/api/customer/getAllCustomerList",
  GET_CUSTOMER_CONFIG: (id: string) => `/api/customer/getCustomerById/${id}`,

  //PUT API

  //DELETE API
};

export default ApiConstants;
