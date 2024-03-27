export const LOGIN_PATH = "/user/login";
export const LOGOUT_PATH = "/user/logout";
export const SIGNUP_PATH = "/user/signup";
export const PUT_PERMISSION = "/user/permission";
export const GET_PERMISSION = "/user/getpermission";


//permissions
export const ADMIN_PERMISSIONS = "A";
export const MANAGER_PERMISSIONS = "M";
export const WORKER_PERMISSIONS = "W";
export const USER_PERMISSIONS = "U";

//errors
export const ERROR_401 = "ERROR_401";

//events paths
export const GET_EVENTS = "/api/events";
export const GET_EVENT_BY_ID = "/api/event/:id";
export const PUT_EVENT_BY_ID = "/api/event/:id";
export const DELETE_EVENT_BY_ID = "/api/event/:id";
export const POST_EVENT = "/api/create";
export const RESERVE_TICKET_EVENT = "/api/reserveticket";
export const BUY_TICKET_EVENT = "/api/buyticket";

//order paths
export const CREATE_ORDER_PATH = "/create";
export const GET_ORDER_BY_EVENT_ID = "/getbyeventid/:id";
export const GET_ORDER_BY_USER_ID = "/getbyuserid/:id";

//commet paths
export const CREATE_COMMENT_PATH = "/create";
export const GET_COMMENT_BY_EVENT_ID = "/getbycommentid/:id";
export const GET_COMMENT_BY_USER_ID = "/getbyuserid/:id";

