    const express= require('express');
    const path = require('path');
    const bcrypt = require('bcrypt');
    const collection = require('./config');
    const mongoose = require('mongoose');
    const socketIo = require('socket.io');
    const http = require('http');
    const nodemailer = require('nodemailer');
    require('dotenv').config();
    const session = require('express-session');
    const MongoStore = require('connect-mongo');


    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server);

//Middleware Setup
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.set('view engine', 'ejs');
    app.use(express.static("public"));

    app.use(session({
        secret: 'OrderEase@12345',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
    }));

    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('PORT:', process.env.PORT);

// Authentication Middleware
    function isAuthenticated(req, res, next) {
        if (req.session.userId) {
            return next();
        } else {
            res.redirect('/');
        }
    }


//routes
    app.get('/', (req, res) => { res.render('login'); });
    app.get('/signup', (req, res) => { res.render('signup'); });
    app.get('/home', isAuthenticated, (req, res) => { res.render('home'); });
    app.get('/restaurant',  (req, res) => { res.render('Restaurant'); });
    
//logout
    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.redirect('/home');
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    });


//signup user
    app.post('/signup', async (req, res) => {
        const data={
            email: req.body.email,
            password: req.body.password
        }

        //check if the email already exists
        const existingUser= await collection.findOne({email: data.email});

        if(existingUser){
            return res.send('User already exists');
        }
        else{
            //hash the password
            const saltrounds= 10;
            const hashedPassword= await bcrypt.hash(data.password, saltrounds);

            data.password= hashedPassword;

            const userdata= await collection.insertMany(data);
            console.log(userdata);
            res.redirect('/');
        }

    });


//login user
    app.post('/login', async (req, res) => {
        try {
            const check = await collection.findOne({ email: req.body.email }); 
            if (!check) {
                return res.send('User does not exist');
            }

            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
            if (isPasswordMatch) {
                req.session.userId = check._id;
                res.redirect('/home');
            } else {
                return res.send("Wrong password");
            }
        } catch (error) {
            res.send("Wrong details");
        }
    });
     

    //search Functionality

    const dishes = [
        { id: 'mainCourse_ButterChicken', name: 'Butter Chicken', category: 'Main Course' },
        { id: 'mainCourse_Biryani', name: 'Biryani', category: 'Main Course' },
        { id: 'mainCourse_PaneerButterMasala', name: 'Paneer Butter Masala', category: 'Main Course' },
        { id: 'mainCourse_ChickenTikkaMasala', name: 'Chicken Tikka Masala', category: 'Main Course' },
        { id: 'mainCourse_PalakPaneer', name: 'Palak Paneer', category: 'Main Course' },
        { id: 'mainCourse_FishCurry', name: 'Fish Curry', category: 'Main Course' },
        { id: 'mainCourse_GrilledChicken', name: 'Aloo Gobhi', category: 'Main Course' },
        { id: 'starters_SpringRolls', name: 'Spring Rolls', category: 'Starters' },
        { id: 'starters_Samosa', name: 'Samosa', category: 'Starters' },
        { id: 'starters_ChickenTikka', name: 'Chicken Tikka', category: 'Starters' },
        { id: 'starters_TandooriPrawns', name: 'Tandoori Prawns', category: 'Starters' },
        { id: 'starters_PaniPuri', name: 'Pani Puri', category: 'Starters' },
        { id: 'starters_DahiKebab', name: 'Dahi Kebab', category: 'Starters' },
        { id: 'starters_PaneerTikka', name: 'Paneer Tikka', category: 'Starters' },
        { id: 'salads_CaesarSalad', name: 'Caesar Salad', category: 'Salads' },
        { id: 'salads_GreekSalad', name: 'Greek Salad', category: 'Salads' },
        { id: 'salads_CapreseSalad', name: 'Caprese Salad', category: 'Salads' },
        { id: 'salads_CobbSalad', name: 'Cobb Salad', category: 'Salads' },
        { id: 'salads_SpinachSalad', name: 'Spinach Salad', category: 'Salads' },
        { id: 'salads_WaldorfSalad', name: 'Waldorf Salad', category: 'Salads' },
        { id: 'salads_NicoiseSalad', name: 'Nicoise Salad', category: 'Salads' },
        { id: 'desserts_ApplePie', name: 'Apple Pie', category: 'Desserts' },
        { id: 'desserts_ChocolateCake', name: 'Chocolate Cake', category: 'Desserts' },
        { id: 'desserts_Cheesecake', name: 'Cheesecake', category: 'Desserts' },
        { id: 'desserts_GulabJamun', name: 'Gulab Jamun', category: 'Desserts' },
        { id: 'desserts_Bakalava', name: 'Bakalava', category: 'Desserts' },
        { id: 'desserts_PannaCotta', name: 'Panna Cotta', category: 'Desserts' },
        { id: 'desserts_Tiramisu', name: 'Tiramisu', category: 'Desserts' },
        { id: 'beverages_Coffee', name: 'Coffee', category: 'Beverages' },
        { id: 'beverages_IcedTea', name: 'Iced Tea', category: 'Beverages' },
        { id: 'beverages_HerbalTea', name: 'Herbal Tea', category: 'Beverages' },
        { id: 'beverages_Lassi', name: 'Lassi', category: 'Beverages' },
        { id: 'beverages_HotChocolate', name: 'Hot Chocolate', category: 'Beverages' },
        { id: 'beverages_Frappe', name: 'Frappe', category: 'Beverages' },
        { id: 'beverages_Kombucha', name: 'Kombucha', category: 'Beverages' },
        { id: 'breads_Naan', name: 'Naan', category: 'Breads' },
        { id: 'breads_TawaRoti', name: 'Tawa Roti', category: 'Breads' },
        { id: 'breads_Paratha', name: 'Paratha', category: 'Breads' },
        { id: 'breads_Puri', name: 'Puri', category: 'Breads' },
        { id: 'breads_GarlicNaan', name: 'Garlic Naan', category: 'Breads' },
        { id: 'breads_AlooParatha', name: 'Aloo Paratha', category: 'Breads' },
        { id: 'breads_TandooriRoti', name: 'Tandoori Roti', category: 'Breads' }
    ];

    app.post('/search', (req, res) => {
        const query = req.body.query.toLowerCase();
        const results = dishes.filter(dish => dish.name.toLowerCase().includes(query));
        res.json(results);
    });

    // define order schema 
    const orderSchema = new mongoose.Schema({
        items: [
            {
                id: String,
                quantity: Number
            }
        ],
        tableNumber: String,
        date: {
            type: Date,
            default: Date.now
        }
    });

    const Order = mongoose.model("Order", orderSchema);

    app.post('/submit-order', async (req, res) => {
        const { cartItems, tableNumber } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in cart' });
        }

        if (!tableNumber) {
            return res.status(400).json({ success: false, message: 'Table number is required' });
        }

        try {
            const newOrder = new Order({ items: cartItems, tableNumber });
            await newOrder.save();
            io.emit('newOrder', newOrder);
            res.json({ success: true, message: 'Order submitted successfully!' });
        } catch (error) {
            console.error('Error submitting order:', error);
            res.status(500).json({ success: false, message: 'Error submitting order' });
        }
    });

    // Configure email service
    const transporter = nodemailer.createTransport({
        service: 'gmail',   
        auth: {
            user: 'soni.prakhar.004@gmail.com',
            pass: process.env.pass
        }
    });

    const feedbackSchema = new mongoose.Schema({
        name: String,
        email: String,
        feedback: String
    });

    const Feedback = mongoose.model("feedbacks", feedbackSchema);

    app.post('/submit-feedback', async (req, res) => {
        const { name, email, feedback } = req.body;

        if (!name || !email || !feedback) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        try {
            const newFeedback = new Feedback({ name, email, feedback });
            await newFeedback.save();
            
            const mailOptions = {
                from: 'OrderEase@gmail.com',
                to: email,
                subject: 'Thank you for your feedback',
                text: `Dear ${name},\n\nThank you for your feedback. We appreciate your effort to help us improve.\n\nBest regards,\nOrderEase`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ success: false, message: 'Error sending email' });
                } else {
                    console.log('Email sent:', info.response);
                    res.json({ success: true, message: 'Feedback successfully submitted and email sent' });
                }
            });

        } catch (error) {
            console.error('Error submitting feedback:', error);
            res.status(500).json({ success: false, message: 'Error submitting feedback' });
        }
    });



    /////////////Restaurant Page/////////////


    app.get('/api/orders', async (req, res) => {
        try {
            const receivedOrder = await Order.find();
            res.json(receivedOrder);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ success: false, message: 'Error fetching orders' });
        }
    });

    app.get('/api/feedbacks', async (req, res) => {
        try {
            const feedbacks = await Feedback.find();
            res.json(feedbacks);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            res.status(500).json({ success: false, message: 'Error fetching feedbacks' });
        }
    });

    
    io.on('connection', (socket) => {
        console.log('A user connected');
        
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
    
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });