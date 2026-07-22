import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";

const GQL_URL = import.meta.env.VITE_GQL_URL
  ?? `http://${window.location.hostname}:9000/typiql/graphql`;

export function getAppId() {
  let id = localStorage.getItem("monocoque_app_id");
  if (!id) {
    id = getDeviceId();
    localStorage.setItem("monocoque_app_id", id);
  }
  return id;
}

function getDeviceId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: GQL_URL }),
  cache: new InMemoryCache(),
});
