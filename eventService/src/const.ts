export const GET_EVENTS = "/api/events";
export const GET_EVENT_BY_ID = "/api/event/:id";
export const PUT_EVENT_BY_ID = "/api/event/:id";
export const DELETE_EVENT_BY_ID = "/api/event/:id";
export const POST_EVENT = "/api/create";
export const RESERVE_TICKET_EVENT = "/api/reserveticket";
export const BUY_TICKET_EVENT = "/api/buyticket";
export const REFUND_ORDERID = "/api/refund/:id";


// export const GET_EVENT_BY_CATEGORY = "GET /api/event/:category";
// export const GET_EVENT_BY_ORGANIZER = "GET /api/event/organizer/";

export const VALID_CATEGORYES = [
  "Charity Event",
  "Concert",
  "Conference",
  "Convention",
  "Exhibition",
  "Festival",
  "Product Launch",
  "Sports Event",
];

//permissions
export const ADMIN_PERMISSIONS = "A";
export const MANAGER_PERMISSIONS = "M";
export const WORKER_PERMISSIONS = "W";
export const USER_PERMISSIONS = "U";

//errors
export const ERROR_401 = "ERROR_401";
