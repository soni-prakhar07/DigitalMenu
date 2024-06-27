const express= require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');
require('dotenv').config();

const app = express();

//data to json
app.use(express.json());

app.use(express.urlencoded({extended: false}));

//set EJS as the view engine
app.set('view engine', 'ejs');

//static files
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

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
    try{
        const check= await collection.findOne({email: req.body.email}); 
        if(!check){
            return res.send('User does not exist');
        }

        const isPasswordMatch= await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch){
            res.render('home');
        }else{
            return req.send("wrong password");
        }

    }catch{
        res.send("wrong details")
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



const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});