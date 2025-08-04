// ecosystem.config.js
module.exports = {
    apps: [
      {
        name: 'telegram-bot',
        script: './index.js', // or server.js if you ever split logic
        watch: false,
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 443
        }
      }
    ]
  };
  