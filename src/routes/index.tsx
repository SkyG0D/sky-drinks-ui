const routes = {
  HOME: "/",
  NOT_AUTHORIZED: "/not-authorized",

  LOGIN: "/login",
  LOGOUT: "logout",

  LIST_IMAGES: "drinks/images",
  SEARCH_DRINKS: "drinks/search",
  MANAGE_DRINKS: "drinks/manage",
  VIEW_DRINK: "/drinks/:uuid",
  CREATE_DRINK: "/drinks/create",
  EDIT_DRINK: "/drinks/edit/:uuid",

  MANAGE_USERS: "users/manage",
  CREATE_USER: "/users/create",
  EDIT_USER: "/users/edit/:uuid",
  MY_ACCOUNT: "my-account",

  FINALIZE_REQUEST: "requests/finish",
  REQUEST_CREATED: "requests/created",
  VIEW_REQUEST: "requests/view/:uuid",
  FIND_REQUEST: "requests/find/",
  MANAGE_REQUESTS: "requests/manage",
  SEARCH_REQUESTS: "requests/search",
  MY_REQUESTS: "my-requests",

  MANANGE_TABLES: "tables/manage",
};

export default routes;
