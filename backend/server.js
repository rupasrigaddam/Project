const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/busTrackingDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schemas
const userSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now }
});

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  route: { type: String, required: true },
  area: { type: String, required: true },
  fromCity: { type: String, required: true },
  toCity: { type: String, required: true },
  driverName: String,
  driverPhone: String,
  capacity: Number,
  currentLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  destination: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  isActive: { type: Boolean, default: true },
  currentSpeed: { type: Number, default: 0 }, // km/h
  lastUpdated: { type: Date, default: Date.now }
});

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  area: { type: String, required: true },
  stops: [{
    stopName: String,
    latitude: Number,
    longitude: Number,
    estimatedTime: String
  }]
});

// Models
const User = mongoose.model('User', userSchema);
const Bus = mongoose.model('Bus', busSchema);
const Route = mongoose.model('Route', routeSchema);

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key_change_in_production';

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Helper function to estimate arrival time
const estimateArrivalTime = (distance, currentSpeed = 30) => {
  const averageSpeed = currentSpeed > 0 ? currentSpeed : 30; // km/h
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = Math.round(timeInHours * 60);
  return timeInMinutes;
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { studentId, name, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      studentId,
      name,
      email,
      password: hashedPassword,
      phoneNumber
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, studentId: user.studentId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, studentId: user.studentId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bus Routes
app.get('/api/buses', authenticateToken, async (req, res) => {
  try {
    const buses = await Bus.find({ isActive: true });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/buses/area/:area', authenticateToken, async (req, res) => {
  try {
    const { area } = req.params;
    const buses = await Bus.find({ area, isActive: true });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/buses/:busNumber', authenticateToken, async (req, res) => {
  try {
    const { busNumber } = req.params;
    const bus = await Bus.findOne({ busNumber });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/buses/track', authenticateToken, async (req, res) => {
  try {
    const { busNumber, userLatitude, userLongitude } = req.body;

    const bus = await Bus.findOne({ busNumber, isActive: true });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const distanceFromUser = calculateDistance(
      userLatitude,
      userLongitude,
      bus.currentLocation.latitude,
      bus.currentLocation.longitude
    );

    const distanceToDestination = calculateDistance(
      bus.currentLocation.latitude,
      bus.currentLocation.longitude,
      bus.destination.latitude,
      bus.destination.longitude
    );

    const estimatedTimeToUser = estimateArrivalTime(distanceFromUser, bus.currentSpeed);
    const estimatedTimeToDestination = estimateArrivalTime(distanceToDestination, bus.currentSpeed);

    res.json({
      bus: {
        busNumber: bus.busNumber,
        route: bus.route,
        area: bus.area,
        fromCity: bus.fromCity,
        toCity: bus.toCity,
        driverName: bus.driverName,
        driverPhone: bus.driverPhone,
        currentLocation: bus.currentLocation,
        destination: bus.destination,
        currentSpeed: bus.currentSpeed,
        lastUpdated: bus.lastUpdated
      },
      distanceFromUser: distanceFromUser.toFixed(2),
      distanceToDestination: distanceToDestination.toFixed(2),
      estimatedArrivalToUser: estimatedTimeToUser,
      estimatedArrivalToDestination: estimatedTimeToDestination,
      userLocation: {
        latitude: userLatitude,
        longitude: userLongitude
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unique areas
app.get('/api/areas', authenticateToken, async (req, res) => {
  try {
    const areas = await Bus.distinct('area');
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unique cities
app.get('/api/cities', authenticateToken, async (req, res) => {
  try {
    const fromCities = await Bus.distinct('fromCity');
    res.json(fromCities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route information
app.get('/api/routes', authenticateToken, async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/routes/area/:area', authenticateToken, async (req, res) => {
  try {
    const { area } = req.params;
    const routes = await Route.find({ area });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin route to update bus location (for testing/demo)
app.put('/api/buses/:busNumber/location', async (req, res) => {
  try {
    const { busNumber } = req.params;
    const { latitude, longitude, speed } = req.body;

    const updateData = {
      currentLocation: { latitude, longitude },
      lastUpdated: new Date()
    };

    if (speed !== undefined) {
      updateData.currentSpeed = speed;
    }

    const bus = await Bus.findOneAndUpdate(
      { busNumber },
      updateData,
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json({ message: 'Bus location updated', bus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Seed data route (for testing)
app.post('/api/seed', async (req, res) => {
  try {
    await Bus.deleteMany({});
    await Route.deleteMany({});

    // University campus location (Vignan University, Guntur)
    const universityLocation = { latitude: 16.4419, longitude: 80.5189 };

    // Sample buses from different cities
    const buses = [
      // From Guntur
      {
        busNumber: 'VU-GT-101',
        route: 'A1',
        area: 'Guntur',
        fromCity: 'Guntur',
        toCity: 'Vignan University',
        driverName: 'Rajesh Kumar',
        driverPhone: '+91-9876543210',
        capacity: 50,
        currentLocation: { latitude: 16.3067, longitude: 80.4365 }, // Guntur city
        destination: universityLocation,
        currentSpeed: 35,
        isActive: true
      },
      {
        busNumber: 'VU-GT-102',
        route: 'A2',
        area: 'Guntur',
        fromCity: 'Guntur',
        toCity: 'Vignan University',
        driverName: 'Suresh Reddy',
        driverPhone: '+91-9876543211',
        capacity: 45,
        currentLocation: { latitude: 16.3500, longitude: 80.4600 },
        destination: universityLocation,
        currentSpeed: 40,
        isActive: true
      },
      // From Vijayawada
      {
        busNumber: 'VU-VJ-201',
        route: 'B1',
        area: 'Vijayawada',
        fromCity: 'Vijayawada',
        toCity: 'Vignan University',
        driverName: 'Venkat Rao',
        driverPhone: '+91-9876543212',
        capacity: 50,
        currentLocation: { latitude: 16.5062, longitude: 80.6480 }, // Vijayawada
        destination: universityLocation,
        currentSpeed: 45,
        isActive: true
      },
      {
        busNumber: 'VU-VJ-202',
        route: 'B2',
        area: 'Vijayawada',
        fromCity: 'Vijayawada',
        toCity: 'Vignan University',
        driverName: 'Prakash Singh',
        driverPhone: '+91-9876543213',
        capacity: 48,
        currentLocation: { latitude: 16.5100, longitude: 80.6300 },
        destination: universityLocation,
        currentSpeed: 42,
        isActive: true
      },
      // From Tenali
      {
        busNumber: 'VU-TN-301',
        route: 'C1',
        area: 'Tenali',
        fromCity: 'Tenali',
        toCity: 'Vignan University',
        driverName: 'Ramesh Babu',
        driverPhone: '+91-9876543214',
        capacity: 45,
        currentLocation: { latitude: 16.2428, longitude: 80.6474 }, // Tenali
        destination: universityLocation,
        currentSpeed: 38,
        isActive: true
      },
      {
        busNumber: 'VU-TN-302',
        route: 'C2',
        area: 'Tenali',
        fromCity: 'Tenali',
        toCity: 'Vignan University',
        driverName: 'Krishna Murthy',
        driverPhone: '+91-9876543215',
        capacity: 50,
        currentLocation: { latitude: 16.2600, longitude: 80.6300 },
        destination: universityLocation,
        currentSpeed: 40,
        isActive: true
      },
      // From Mangalagiri
      {
        busNumber: 'VU-MG-401',
        route: 'D1',
        area: 'Mangalagiri',
        fromCity: 'Mangalagiri',
        toCity: 'Vignan University',
        driverName: 'Srinivas Rao',
        driverPhone: '+91-9876543216',
        capacity: 48,
        currentLocation: { latitude: 16.4305, longitude: 80.5527 },
        destination: universityLocation,
        currentSpeed: 36,
        isActive: true
      },
      // From Chilakaluripet
      {
        busNumber: 'VU-CL-501',
        route: 'E1',
        area: 'Chilakaluripet',
        fromCity: 'Chilakaluripet',
        toCity: 'Vignan University',
        driverName: 'Nagarjuna Reddy',
        driverPhone: '+91-9876543217',
        capacity: 50,
        currentLocation: { latitude: 16.0892, longitude: 80.1672 },
        destination: universityLocation,
        currentSpeed: 44,
        isActive: true
      },
      // From Bapatla
      {
        busNumber: 'VU-BP-601',
        route: 'F1',
        area: 'Bapatla',
        fromCity: 'Bapatla',
        toCity: 'Vignan University',
        driverName: 'Mahesh Kumar',
        driverPhone: '+91-9876543218',
        capacity: 45,
        currentLocation: { latitude: 15.9041, longitude: 80.4673 },
        destination: universityLocation,
        currentSpeed: 39,
        isActive: true
      },
      // From Sattenapalle
      {
        busNumber: 'VU-ST-701',
        route: 'G1',
        area: 'Sattenapalle',
        fromCity: 'Sattenapalle',
        toCity: 'Vignan University',
        driverName: 'Ravi Teja',
        driverPhone: '+91-9876543219',
        capacity: 48,
        currentLocation: { latitude: 16.3950, longitude: 80.1488 },
        destination: universityLocation,
        currentSpeed: 41,
        isActive: true
      }
    ];

    await Bus.insertMany(buses);

    res.json({ 
      message: 'Database seeded successfully',
      busesCount: buses.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});