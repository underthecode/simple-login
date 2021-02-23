const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Castle, EVENTS } = require('@castleio/sdk');

const jwtSecret = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
const castle = new Castle({ apiSecret: process.env.CASTLE_API_SECRET });

const client = new MongoClient(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const findUser = (db, email, callback) => {
  const collection = db.collection('users');
  collection.findOne({ email }, callback);
};

const authUser = (password, hash, callback) => {
  bcrypt.compare(password, hash, callback);
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
              res
                .status(404)
                .json({ error: true, message: 'Please provide a valid email' });
              return;
            } else {
              authUser(password, user.password, (err, match) => {
                if (err) {
                  res
                    .status(500)
                    .json({ error: true, message: 'Error finding user' });
                }
                if (match) {
                  const token = jwt.sign(
                    { userId: user.userId, email: user.email },
                    jwtSecret,
                    {
                      expiresIn: 3000
                    }
                  );
                  const response = castle.authenticate({
                    event: EVENTS.LOGIN_SUCCEEDED,
                    user_id: user.userId,
                    user_traits: {
                      email: user.email,
                      registered_at: '2021-02-21T00:00:00.000Z'
                    },
                    context: {
                      client_id: token,
                      ip: '248.186.33.141',
                      headers: req.headers
                    }
                  });
                  console.log(response);
                  res.status(200).json({ token });
                  return;
                } else {
                  res.status(401).json({
                    error: true,
                    message: 'Please provide a valid email'
                  });
                }
              });
            }
          });
        });
      } catch (err) {
        res.status(403).send(err);
      }
    } else {
      res.status(401).end();
    }
  });
};
