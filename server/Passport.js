const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const jwt = require('jsonwebtoken');
const connectToDatabase = require('./db'); // ваш файл для підключення до бази даних
const { secret } = require('./models/ConfigKey');
require('dotenv').config();

//Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL:
        'https://randomizer-app-production.up.railway.app/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        let user = await usersCollection.findOne({ googleId: profile.id });

        if (!user) {
          user = await usersCollection.findOne({
            email: profile.emails[0].value,
          });

          if (!user) {
            const newUser = {
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
            };
            const result = await usersCollection.insertOne(newUser);
            user = { ...newUser, _id: result.insertedId };
          } else {
            // Якщо користувач знайдений за email, оновимо його googleId
            await usersCollection.updateOne(
              { email: profile.emails[0].value },
              { $set: { googleId: profile.id } }
            );
            user.googleId = profile.id;
          }
        }

        // Створити токен
        const tokenPayload = {
          id: user._id,
          username: user.username,
        };
        const token = jwt.sign(tokenPayload, secret, { expiresIn: '24h' });

        // Передати користувача та токен через done()
        done(null, { ...user, token });
      } catch (error) {
        done(error); // Обробка помилок
      }
    }
  )
);

//Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_F,
      clientSecret: process.env.CLIENT_SECRET_F,
      callbackURL:
        'https://randomizer-app-production.up.railway.app/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        let user = await usersCollection.findOne({ facebookId: profile.id });

        if (!user) {
          user = await usersCollection.findOne({
            email: profile.emails[0].value,
          });

          if (!user) {
            const newUser = {
              facebookId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
            };
            const result = await usersCollection.insertOne(newUser);
            user = { ...newUser, _id: result.insertedId };
          } else {
            // Якщо користувач знайдений за email, оновимо його facebookId
            await usersCollection.updateOne(
              { email: profile.emails[0].value },
              { $set: { facebookId: profile.id } }
            );
            user.facebookId = profile.id;
          }
        }

        const tokenPayload = {
          id: user._id,
          username: user.username,
        };
        const token = jwt.sign(tokenPayload, secret, { expiresIn: '24h' });

        done(null, { ...user, token });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(new GitHubStrategy({
  clientID: process.env.CLIENT_ID_G,
  clientSecret: process.env.CLIENT_SECRET_G,
  callbackURL: "https://randomizer-app-production.up.railway.app/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
  const db = await connectToDatabase();
  const usersCollection = db.collection('users');

  let user = await usersCollection.findOne({ githubId: profile.id });

  if (!user) {
    user = await usersCollection.findOne({
      email: profile.emails[0].value,
    });

    if (!user) {
      const newUser = {
        githubId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
      };
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // Якщо користувач знайдений за email, оновимо його facebookId
      await usersCollection.updateOne(
        { email: profile.emails[0].value },
        { $set: { githubId: profile.id, } }
      );
      user.githubId = profile.id;
    }
  }

  const tokenPayload = {
    id: user._id,
    username: user.username,
  };
  const token = jwt.sign(tokenPayload, secret, { expiresIn: '24h' });

  done(null, { ...user, token });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
