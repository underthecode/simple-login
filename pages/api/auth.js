const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

const client = new MongoClient(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const findUser = (db, email, callback) => {
  const collection = db.collection('user');
  collection.findOne({ email }, callback);
};

const authUser = (password, hash, callback) => {
  bcrypt.compare(password, hash, callback);
};

export default (req, res) => {
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
};
