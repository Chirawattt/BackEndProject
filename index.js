// Description: BankEnd for Project
// npm install express sequelize sqlite3
// Test with Postman

const express = require('express'); // web framework
const Sequelize = require('sequelize');
const app = express(); // web app
const fs = require('fs');
const path = require('path');
const session = require('express-session');



// parse incoming requests
app.use(express.json()); // format to transfer data in json
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:false
}));

// create a connection to the database
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite', // use format of sqlite
    storage: './Database/breadStore.sqlite' // datavase store at
});

// define the User model 
const User = sequelize.define('user', { // 'objectname', {object detail}
    userId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true // make userID to be primary key which can search by id
    },
    fname: {
        type: Sequelize.STRING,
        allowNull: false // not allow to null
    },
    lname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userImg: {
        type: Sequelize.STRING,
        allowNull: true
    },
    role: {
        type: Sequelize.STRING,
        defaultValue: 'user'
    }
});

// Define the Bread Model
const Bread = sequelize.define('bread', {
    breadId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    typeBread: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descript: {
        type: Sequelize.STRING,
        allowNull: false
    },
    breadImg: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

// Define the cart model
const Cart = sequelize.define('cart', {
    cartId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Define the CartDetail model
const CartDetail = sequelize.define('cartDetail', {
    cartDetailId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    cart_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bread_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    subtotal: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

// Define the Order model
const Order = sequelize.define('order', {
    orderId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    cart_id: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Define the payment model
const Payment = sequelize.define('payment', {
    paymentId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    paymentDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    },
    paymentImg: {
        type: Sequelize.STRING,
        allowNull: true
    }
    
});

// create the Bread Strore database table if it doesn't exist
sequelize.sync();


// Function that query username and password and return interger pk
async function authenUser(username, password){
    try {
        // Find a user with the provided username
        const user = await User.findOne({
            where: {username: username}
        })
        // If a user is found 
        if (user) {
            // Check if the provided password matches the stored password
            if (user.password === password) {
                // Password is correct, return the user
                return user;
            }else {
                // Password is incorrect, return a message
                return "!password";
            }
        } else {
            // User not found, return a message
            return "!username&!password";
        }
    } catch(error) {
        console.log('Error querying database:', error);
        throw error;
    }

}

// route to create an account
app.post('/user/register', (req, res) => {
    User.findOne({
        where: {username: req.body.username}
    }).then(data => {
        if (data) res.send('Your username is already used!\nPlease try another username.')
        else {
            User.create(req.body).then(user => {
                res.json(user);
            }).catch(err => {
                res.status(500).send(err);
            });
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

// route to login an account by using post
app.post('/user/login', async (req, res) => {
    try {
        const user = await authenUser(req.body.username, req.body.password);
        if (user === "!password") res.send("Invalid Password\nPlease try again!");
        else if (user === "!username&!password") res.send("Invalid Username and Password\nPlease try again!");
        else {
            req.session.userId = user.userId;
            res.json(user);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

// route to get user information
app.get('/user/getData', (req,res) => {
    User.findOne({
        where: {userId: req.session.userId}
    }).then(data => {
        if(data) res.json(data);
        else res.send("Doesn't have data of this user");
    }).catch(err => {
        res.status(500).send(err);
    })
});

// route to update data of User
app.post('/user/update/:id', (req, res) => {
    // User.findByPk(req.params.id).then(data => {
        
    // })
})

// route to create data of Bread
app.post('/bread/new', (req, res) => {
    Bread.findOne({
        where: {name: req.body.name}
    }).then(data => {
        if(data) res.send('Name of this bread is already in use!\nPlease try another name of bread');
        else {
            Bread.create(req.body).then(bread => {
                res.json(bread);
            }).catch(err => {
                res.status(500).send(err);
            });
        }
    }).catch(err => {
        res.status(500).send(err);
    })
});

// route to get all bread
app.get('/bread/all', (req, res) =>{
    Bread.findAll().then(data => {
        if(data) res.json(data);
        else res.send("All bread not found");
    }).catch(err => {
        res.status(500).send(err);
    })
});

// route to delete a bread
app.delete('/bread/delete/:id', (req, res) =>{
    Bread.findByPk(req.params.id).then(data => {
        if(data) {
            data.destroy().then(() =>{
                res.send(`${data.name} has been delete from Bread store`);
            }).catch(err => {
                res.status(500).send(err);
            })
        }else res.status(404).send("Not found this bread");
    }).catch(err => {
        res.status(500).send(err);
    })
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
