const ApiConstants = {
  //POST API
  REGISTER_USER: () => `/api/auth/register`,
  LOGIN_USER: () => `/api/auth/login`,
  UPLOAD_CSV: () => `/api/invoice/uploadAndGetInvoiceData`,
  UPLOAD_AND_GET_INVOICE_DATA: () => `/api/invoice/uploadAndGetInvoiceData`,
  SAVE_INVOICE_DATA: () => `/api/invoice/saveInvoiceData`,
  UPLOAD_AND_PARSE_DOCUMENT: () => "/api/order/uploadAndParseDocument",
  //GET API
  CHECK_AUTH: () => `/api/auth/checkAuth`,
  GET_ALL_USERS: () => `/api/auth/getAllUsers`,
  GET_ALL_CUSTOMERS: () => "/api/customer/getAllCustomerList",
  GET_CUSTOMER_CONFIG: (id: string) => `/api/customer/getCustomerById/${id}`,
  GET_ALL_ORDERS: () => `/api/order/getAllOrders`,
  //PUT API
  UPDATE_ORDER_BY_ID: () => `/api/order/updateOrder/`,
  //DELETE API
  DELETE_ORDER_BY_ID: (orderId: string) => `/api/order/deleteOrder/${orderId}`,
};

export default ApiConstants;
