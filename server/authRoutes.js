const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    const { token, username, _id } = req.user;
    res.send(`<script>
                localStorage.setItem('token', '${token}');
                localStorage.setItem('username', '${username}');
                localStorage.setItem('user_id', '${_id}')
                window.location.href = '/index.html';
              </script>`);
  }
);
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login.html' }),
  (req, res) => {
    const { token, username, _id } = req.user;
    res.send(`<script>
                localStorage.setItem('token', '${token}');
                localStorage.setItem('username', '${username}');
                localStorage.setItem('user_id', '${_id}')
                window.location.href = '/index.html';
              </script>`);
  }
);

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login.html' }),
  (req, res) => {
    const { token, username, _id } = req.user;
    res.send(`<script>
                localStorage.setItem('token', '${token}');
                localStorage.setItem('username', '${username}');
                localStorage.setItem('user_id', '${_id}')
                window.location.href = '/index.html';
              </script>`);
  }
);

module.exports = router;