import express from 'express';
import cors from 'cors';
import availabilityRoutes from './routes/availability';
import bookingsRoutes from './routes/bookings';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Orchestrator Online' });
});

export default app;
