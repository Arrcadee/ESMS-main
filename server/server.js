require('dotenv').config();

const app = require('./app');
const { connect } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connect();

    const server = app.listen(PORT, () => {
      console.log(`\n✓ ESMS Server running on http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/api/health\n`);
    });

    // Catch port-already-in-use and other listen errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`✗ Port ${PORT} is already in use. Kill the existing process and retry.`);
      } else {
        console.error('✗ Server error:', err.message);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error('✗ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();