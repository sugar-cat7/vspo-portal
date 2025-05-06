import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const fetcher = <T>(url: string) =>
  api.get<T>(url).then((res) => res.data);
