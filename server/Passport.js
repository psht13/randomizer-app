const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const connectToDatabase = require('./db'); // ваш файл для підключення до бази даних
const { secret } = require('./models/ConfigKey');

passport.use(
  new GoogleStrategy(
    {
      clientID:
        '739884039570-9dm1ci158kn2q83b0iep1pmm4psmlus2.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:2000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        let user = await usersCollection.findOne({ googleId: profile.id });

        if (!user) {
          // Якщо користувача немає в базі даних, додати його
          const newUser = {
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
          };
          const result = await usersCollection.insertOne(newUser);
          user = { ...newUser, _id: result.insertedId }; // Отримати ID нового користувача з результату вставки
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

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
