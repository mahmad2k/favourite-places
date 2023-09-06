import "dotenv/config";

export default {
  name: "CoolApp",
  version: "1.0.0",
  extra: {
    GOOGLE_MAPS_URL: process.env.GOOGLE_MAPS_URL,
  },
};
