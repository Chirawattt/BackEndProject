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
    saveUninitialized:true
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
});

// Define the CartDetail model
const CartDetail = sequelize.define('cartDetail', {
    cartDetailId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    cart_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    bread_id: {
        type: Sequelize.INTEGER,
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
            if (user.password === password) { // Check if the provided password matches the stored password
                return user; // Password is correct, return the user
            }else {
                return "!password"; // Password is incorrect, return a message
            }
        } else {
            return "!username&!password"; // User not found, return a message
        }
    } catch(error) {
        console.log('Error querying database:', error);
        throw error;
    }
}

// route to get all user
app.get('/user/getUser', (req, res) => {
    User.findAll().then(data => {
        if (data) res.json(data);
        else res.status(404).send("Can't find all user");
    }).catch(err => {
        res.status(500).send(err);
    });
});

// route to get user information by id
app.get('/user/getUser/:id', (req,res) => {
    User.findByPk(req.params.id).then(data => {
        if (data) res.json(data);
        else res.status(404).send("Doesn't have data of this user");
    }).catch(err => {
        res.status(500).send(err);
    });
});

// route to create an account
app.post('/user/register', (req, res) => {
    try {
        User.findAll().then(data => {
            let Alldata = [];
            let registerValid = true;
            let strError = "";
            if (data) {
                data.forEach(user => {
                    Alldata.push(user.dataValues.username);
                    Alldata.push(user.dataValues.email);
                    Alldata.push(user.dataValues.phone);
                });

                if (Alldata.includes(req.body.username)) {
                   strError = `\nUsername: "${req.body.username}" is already use`;
                   registerValid = false;
                }if (Alldata.includes(req.body.email)) {
                    strError += `\nemail: "${req.body.email}" is already use`;
                    registerValid = false;
                }if (Alldata.includes(req.body.phone)) {
                    strError += `\nPhone number: "${req.body.phone}" is already use`;
                    registerValid = false;
                }
                
                if (registerValid) {
                    User.create(req.body).then(data => {
                        Cart.create({ // Generate Cart for new user
                            user_id: data.dataValues.userId
                        }).then(() => {
                            res.send(`Already generated cart for User: '${data.dataValues.username}'\nRegister Successfully!`);
                        }).catch(err => {
                            res.status(500).send(err);
                        });
                    }).catch(err => {
                        res.status(500).send(err);
                    });
                }else {
                    res.send('Register Unsuccessfully!' + strError + '\nPlease try again!');
                }
            } else res.send('Could not find except User');
        }).catch(err => {
            res.status(500).send(err);
        })
    } catch (err) {
        res.status(500).send(err);
    }
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

// route to update data of User
app.post('/user/update/:id', (req, res) => {
    try {
        User.findAll({
            where: {userId: {[Sequelize.Op.ne]: req.params.id}}
        }).then(data => {
            let Alldata = [];
            let updateValid = true;
            let strError = "";
            if (data) {
                data.forEach(user => {
                    Alldata.push(user.dataValues.username);
                    Alldata.push(user.dataValues.email);
                    Alldata.push(user.dataValues.phone);
                });

                if (Alldata.includes(req.body.username)) {
                   strError = `\nUsername: "${req.body.username}" is already use`;
                   updateValid = false;
                }if (Alldata.includes(req.body.email)) {
                    strError += `\nemail: "${req.body.email}" is already use`
                    updateValid = false;
                }if (Alldata.includes(req.body.phone)) {
                    strError += `\nPhone number: "${req.body.phone}" is already use`
                    updateValid = false;
                }
                
                if (updateValid) {
                    User.findByPk(req.params.id).then(user => {
                        user.update(req.body);
                        res.send('Update profile successfully.');
                    }).catch(err => {
                        res.status(500).send(err);
                    });
                }else {
                    res.send('Update Profile invalid' + strError + '\nPlease try again!');
                }
            } else res.send('Could not find except User');
        }).catch(err => {
            res.status(500).send(err);
        })
    } catch (err) {
        res.status(500).send('Error');
    }
});

// route to delete user data
app.delete('/user/delete/:id', (req, res) => {
    User.findByPk(req.params.id).then(data => {
        if (data) {
            res.send(`Account: ${data.username} has been deleted`)
            data.destroy().catch(err => {
                res.status(500).send(err);
            });
        }else res.send(`Does't have these id in system.`);
    }).catch(err => {
        res.status(500).send(err);
    });
});

// route to get all bread
app.get('/bread/all', (req, res) =>{
    Bread.findAll().then(data => {
        if(data) res.json(data);
        else res.send("All bread not found");
    }).catch(err => {
        res.status(500).send(err);
    });
});

// route to get some bread by id
app.get('/bread/get/:id', (req, res) => {
    Bread.findByPk(req.params.id).then(data => {
        if (data) res.json(data);
        else res.send('Not found this bread');
    }).catch(err => {
        res.status(500).send(err);
    });
});

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
    });
});

// route to update data of bread
app.post('/bread/update/:id', (req, res) => {
    try {
        Bread.findAll({
            where: {breadId: {[Sequelize.Op.ne]: req.params.id}}
        }).then(data => {
            let Alldata = [];
            let updateValid = true;
            let strError = "";
            if (data) {
                data.forEach(bread => {
                    Alldata.push(bread.dataValues.name);
                });

                if (Alldata.includes(req.body.name)) {
                   strError = `\nBread name: "${req.body.name}" is already use`;
                   updateValid = false;
                }
                
                if (updateValid) {
                    Bread.findByPk(req.params.id).then(bread => {
                        bread.update(req.body);
                        res.send('Update Bread successfully.');
                    }).catch(err => {
                        res.status(500).send(err);
                    });
                }else {
                    res.send('Update Bread invalid' + strError + '\nPlease try again!');
                }
            } else res.send('Could not find except Bread');
        }).catch(err => {
            res.status(500).send(err);
        })
    } catch (err) {
        res.status(500).send('Error');
    }
});
// route to delete a bread
app.delete('/bread/delete/:id', (req, res) =>{
    Bread.findByPk(req.params.id).then(data => {
        if(data) {
            res.send(`${data.name} has been delete from Bread store`);
            data.destroy().catch(err => {
                res.status(500).send(err);
            });
        }else res.status(404).send("Not found this bread");
    }).catch(err => {
        res.status(500).send(err);
    });
});


// route to add bread to cart
app.post('/cart/add/:breadId', async (req, res) => { // req.body => cart_id, quantity
    // Prase string breadId to Integer
    breadId = await parseInt(req.params.breadId);
    // Calculate subtotal of bread
    subtotal = await Bread.findByPk(breadId).then(data => {
        if (data) {
            return data.price * req.body.quantity;
        }else return 0;
    }).catch(err => {
        res.status(500).send(err);
    });

    CartDetail.create({
        cart_id: req.body.cart_id,
        bread_id: breadId,
        quantity: req.body.quantity,
        subtotal: subtotal
    }).then(data => {
        if (data) res.json(data);
        else res.send("Cannot add bread into cart!");
    }).catch(err => {
        res.status(500).send(err);
    });
});

// Test some route
app.delete('/cart/delete/:cartDetailId', (req, res) => {
    CartDetail.findByPk(req.params.cartDetailId).then(data => {
        if (data) {
            Bread.findByPk(data.bread_id).then(breadData => {
                res.send(`Deleted bread name: ${breadData.name}\nQuantity: ${data.quantity}\nOut of Cart!`);
            }).catch(err => {res.status(500).send(err);})
            data.destroy().catch(err => {res.status(500).send(err);})
        }else res.send("Can not delete cart detail");

    })
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));