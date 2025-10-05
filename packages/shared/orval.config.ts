import { defineConfig } from "orval";

export default defineConfig({
  reactQuery: {
    input: {
      target: "./openapi/openapi.yaml",
    },
    output: {
      target: "./generated/react-query.ts",
      client: "react-query",
      mode: "single",
      clean: true,
      prettier: true,
    },
  },
  axios: {
    input: {
      target: "./openapi/openapi.yaml",
    },
    output: {
      target: "./generated/axios.ts",
      client: "axios",
      mode: "single",
      clean: false,
      prettier: true,
    },
  },
  zod: {
    input: {
      target: "./openapi/openapi.yaml",
    },
    output: {
      target: "./generated/zod.ts",
      client: "zod",
      mode: "single",
      clean: false,
      prettier: true,
    },
  },
});
