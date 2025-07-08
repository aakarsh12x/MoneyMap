export default {
  dialect: "postgresql",
  schema: "./utils/schema.jsx",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.POSTGRES_URI,
    connectionString:
      process.env.POSTGRES_URI,
  },
};
