module.exports = {
  apps: [{
    name: "corkboard",
    script: "npm start",
    watch: true,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
};
