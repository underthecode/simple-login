const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const v4 = require('uuid').v4;
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const jwtSecret = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

const client = new MongoClient(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const findUser = (db, email, callback) => {
  const collection = db.collection('users');
  collection.findOne({ email }, callback);
};

const createUser = (db, email, password, callback) => {
  const collection = db.collection('users');
  bcrypt.hash(password, saltRounds, (err, hash) => {
    collection.insertOne(
      {
        userId: v4(),
        email,
        password: hash
      },
      (err, userCreated) => {
        callback(userCreated);
      }
    );
  });
};

export default (req, res) => {
  return new Promise(() => {
    if (req.method === 'POST') {
      try {
        client.connect(() => {
          console.log('MongoDB connected');
          const db = client.db(dbName);
          const email = req.body.email;
          const password = req.body.password;

          findUser(db, email, (err, user) => {
            if (err) {
              res
                .status(500)
                .json({ error: true, message: 'Error finding user' });
              return;
            }
            if (!user) {
              createUser(db, email, password, (creationResult) => {
                if (creationResult.ops.length === 1) {
                  const user = creationResult.ops[0];
                  const token = jwt.sign(
                    { userId: user.userId, email: user.email },
                    jwtSecret,
                    {
                      expiresIn: 3000
                    }
                  );
                  res.status(200).json({ token });
                  return;
                }
              });
            } else {
              res.status(403).json({ error: true, message: 'User exists' });
              return;
            }
          });
        });
      } catch (err) {
        res.status(403).json({ error: true, message: err.message });
      }
    } else {
      res.status(200).json({ users: ['John Doe'] });
    }
  });
};
