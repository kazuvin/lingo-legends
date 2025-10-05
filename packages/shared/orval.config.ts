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
      override: {
        mutator: {
          path: "./mutator/custom-instance.ts",
          name: "customInstance",
        },
      },
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
      override: {
        mutator: {
          path: "./mutator/custom-instance.ts",
          name: "customInstance",
        },
      },
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
