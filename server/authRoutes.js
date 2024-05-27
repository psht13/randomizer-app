const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    const { token, username } = req.user;
    res.send(`<script>
                localStorage.setItem('token', '${token}');
                localStorage.setItem('username', '${username}');
                window.location.href = '/index.html';
              </script>`);
  }
);

module.exports = router;