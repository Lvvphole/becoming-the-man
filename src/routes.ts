import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("book", "routes/book.tsx"),
  route("disclaimer", "routes/disclaimer.tsx"),
  route("api/subscribe", "routes/api.subscribe.ts"),
] satisfies RouteConfig;
