let isQueryVisible = false;
class Random {
  static loadPreviousRandomRequests() {
    const requestWrapper = document.querySelector('.random-requests');
    const savedRequests =
      JSON.parse(localStorage.getItem('random-requests')) || [];
    requestWrapper.innerHTML = '';
    savedRequests.forEach(request => {
      const markup = `<div class="request">${request}</div>`;
      requestWrapper.insertAdjacentHTML('afterbegin', markup);
    });
  }

  static loadPreviousSequenceRequests() {
    const requestWrapper = document.querySelector('.sequence-requests');
    const savedRequests =
      JSON.parse(localStorage.getItem('sequence-requests')) || [];
    requestWrapper.innerHTML = '';
    savedRequests.forEach(request => {
      const markup = `<div class="request">${request}</div>`;
      requestWrapper.insertAdjacentHTML('afterbegin', markup);
    });
  }

  static loadPreviousWordRequests() {
    const requestWrapper = document.querySelector('.word-requests');
    const savedRequests =
      JSON.parse(localStorage.getItem('word-requests')) || [];
    requestWrapper.innerHTML = '';
    savedRequests.forEach(request => {
      const markup = `<div class="request">${request}</div>`;
      requestWrapper.insertAdjacentHTML('afterbegin', markup);
    });
  }

  static loadPreviousPasswdRequests() {
    const requestWrapper = document.querySelector('.passwd-requests');
    const savedRequests =
      JSON.parse(localStorage.getItem('passwd-requests')) || [];
    requestWrapper.innerHTML = '';
    savedRequests.forEach(request => {
      const markup = `<div class="request">${request}</div>`;
      requestWrapper.insertAdjacentHTML('afterbegin', markup);
    });
  }

  static loadPreviousPasswdSetRequests() {
    const requestWrapper = document.querySelector('.passwd-set-requests');
    const savedRequests =
      JSON.parse(localStorage.getItem('passwd-set-requests')) || [];
    requestWrapper.innerHTML = '';
    savedRequests.forEach(request => {
      const markup = `<div class="request">${request}</div>`;
      requestWrapper.insertAdjacentHTML('afterbegin', markup);
    });
  }

  static getRandomNumber() {
    let min = parseInt(document.getElementById('min').value);
    let max = parseInt(document.getElementById('max').value);
    const request = document.querySelector('.random-requests');
    const userId = localStorage.getItem('user_id');
    if (isNaN(min) || isNaN(max)) {
      document.getElementById('result').innerText =
        'Будь ласка, введіть числа.';
    } else if (min >= max) {
      document.getElementById('result').innerText =
        'Мінімальне значення повинно бути менше за максимальне.';
    } else {
      fetch(`/random?min=${min}&max=${max}&user_id=${userId}`)
        .then(response => response.text())
        .then(data => {
          document.getElementById('result').innerText = data;
          const markup = `<div class="request">${data}</div>`;
          request.insertAdjacentHTML('afterbegin', markup);

          // Зберігаємо новий запит у localStorage
          const savedRequests =
            JSON.parse(localStorage.getItem('random-requests')) || [];
          savedRequests.push(data);
          savedRequests.splice(0, savedRequests.length - 20);
          localStorage.setItem(
            'random-requests',
            JSON.stringify(savedRequests)
          );
        })
        .catch(error => {
          console.error('Error:', error);
          document.getElementById('result').innerText =
            'Помилка при отриманні даних з сервера.';
        });
    }
  }

  //================================================================

  static getRandomNumbers() {
    let quantity = parseInt(document.getElementById('quantity').value);
    let min = parseInt(document.getElementById('min').value);
    let max = parseInt(document.getElementById('max').value);
    let result = document.getElementById('result');
    const requestWrapper = document.querySelector('.sequence-requests');
    const userId = localStorage.getItem('user_id');

    if (isNaN(min) || isNaN(max)) {
      result.innerHTML =
        'Будь ласка, введіть коректні значення для min та max.';
    } else if (min >= max) {
      result.innerHTML = 'Значення max повинно бути більшим за значення min.';
    } else if (quantity < 1) {
      result.innerHTML = 'Значення кількості має бути більшим за одиницю.';
    } else {
      fetch(
        `/sequence?quantity=${quantity}&min=${min}&max=${max}&user_id=${userId}`
      ) // Append user_id to the URL
        .then(response => response.text())
        .then(data => {
          result.innerHTML = data.slice(0, -2);

          const markup = `<div class="request">${
            data.slice(0, -2) + ';'
          }</div>`;
          requestWrapper.insertAdjacentHTML('afterbegin', markup);

          const savedRequests =
            JSON.parse(localStorage.getItem('sequence-requests')) || [];
          savedRequests.push(data);
          savedRequests.splice(0, savedRequests.length - 20);
          localStorage.setItem(
            'sequence-requests',
            JSON.stringify(savedRequests)
          );
        })
        .catch(error => {
          console.error('Error:', error);
          result.innerHTML = 'Помилка при отриманні даних з сервера.';
        });
    }
  }

  //================================================================

  static getRandomWord() {
    let text = document.getElementById('text').value;
    const requestWrapper = document.querySelector('.word-requests');
    let result = document.getElementById('result');
    const userId = localStorage.getItem('user_id');

    fetch(`/random-word?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          result.innerHTML = data.error;
        } else {
          result.innerHTML = data.randomWord;

          // Додавання випадкового слова до запитів
          const markup = `<div class="request">${data.randomWord}</div>`;
          requestWrapper.insertAdjacentHTML('afterbegin', markup);

          // Збереження нових запитів у localStorage
          const savedRequests =
            JSON.parse(localStorage.getItem('word-requests')) || [];
          savedRequests.push(data.randomWord);
          savedRequests.splice(0, savedRequests.length - 20); // Тримати тільки останні 20 запитів
          localStorage.setItem('word-requests', JSON.stringify(savedRequests));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        result.innerHTML = 'Помилка при отриманні даних з сервера.';
      });
  }

  //================================================================

  static getRandomPassword() {
    let length = parseInt(document.getElementById('length').value);
    const requestWrapper = document.querySelector('.passwd-requests');
    let result = document.getElementById('result');
    const userId = localStorage.getItem('user_id');

    if (isNaN(length) || length <= 0 || length > 128) {
      result.innerHTML = 'Будь ласка, введіть коректну довжину пароля.';
    } else {
      fetch(`/generate-password?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ length: length }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(
              'Network response was not ok ' + response.statusText
            );
          }
          return response.json();
        })
        .then(data => {
          if (data.error) {
            result.innerHTML = data.error;
          } else {
            result.innerHTML = data.password;

            // Додавання згенерованого пароля до запитів
            const markup = `<div class="request">${data.password}</div>`;
            requestWrapper.insertAdjacentHTML('afterbegin', markup);

            // Збереження нових запитів у localStorage
            const savedRequests =
              JSON.parse(localStorage.getItem('passwd-requests')) || [];
            savedRequests.push(data.password);
            savedRequests.splice(0, savedRequests.length - 20); // Тримати тільки останні 20 запитів
            localStorage.setItem(
              'passwd-requests',
              JSON.stringify(savedRequests)
            );
          }
        })
        .catch(error => {
          console.error('Error:', error);
          result.innerHTML = 'Помилка при отриманні даних з сервера.';
        });
    }
  }

  //================================================================

  static getPasswordSet() {
    let quantity = parseInt(document.getElementById('quantity').value);
    let length = parseInt(document.getElementById('length').value);
    const requestWrapper = document.querySelector('.passwd-set-requests');
    let result = document.getElementById('result');
    const userId = localStorage.getItem('user_id');

    if (
      isNaN(quantity) ||
      isNaN(length) ||
      quantity <= 0 ||
      length <= 0 ||
      length > 128
    ) {
      result.innerHTML =
        'Будь ласка, введіть коректні значення для кількості та довжини паролів.';
    } else {
      fetch(`/generate-passwords?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: quantity, length: length }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(
              'Network response was not ok ' + response.statusText
            );
          }
          return response.json();
        })
        .then(data => {
          if (data.error) {
            result.innerHTML = data.error;
          } else {
            result.innerHTML = data.passwordSet.join('<br>');

            // Додавання згенерованого набору паролів до запитів
            const markup = data.passwordSet
              .map(password => `<div class="request">${password}</div>`)
              .join('');
            requestWrapper.insertAdjacentHTML('afterbegin', markup);

            // Збереження нових запитів у localStorage
            const savedRequests =
              JSON.parse(localStorage.getItem('passwd-set-requests')) || [];
            savedRequests.push(...data.passwordSet);
            savedRequests.splice(0, savedRequests.length - 20); // Тримати тільки останні 20 запитів
            localStorage.setItem(
              'passwd-set-requests',
              JSON.stringify(savedRequests)
            );
          }
        })
        .catch(error => {
          console.error('Error:', error);
          result.innerHTML = 'Помилка при отриманні даних з сервера.';
        });
    }
  }
}

document.addEventListener('DOMContentLoaded', e => {
  if (
    window.location.pathname === '/index.html' ||
    window.location.pathname === '/'
  ) {
    Random.loadPreviousRandomRequests();
  } else if (window.location.pathname === '/index1.html') {
    Random.loadPreviousSequenceRequests();
  } else if (window.location.pathname === '/index2.html') {
    Random.loadPreviousWordRequests();
  } else if (window.location.pathname === '/index3.html') {
    Random.loadPreviousPasswdRequests();
  } else if (window.location.pathname === '/index4.html') {
    Random.loadPreviousPasswdSetRequests();
  } else return;
});

class Auth {
  static async register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!username || !email || !password) {
      document.getElementById('result').innerText =
        'Будь ласка, заповніть всі поля.';
      return;
    }

    if (password.length < 8) {
      document.getElementById('result').innerText =
        'Пароль повинен бути не менше 8 символів.';
      return;
    }

    try {
      const response = await fetch('/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        localStorage.setItem('user_id', data.user_id);
        document.getElementById('result').innerText = 'Реєстрація успішна';
        window.location.href = '/index.html';
      } else {
        document.getElementById('result').innerText = data.message;
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('result').innerText = 'Помилка при реєстрації.';
    }
  }

  static async login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      document.getElementById('result').innerText =
        'Будь ласка, заповніть всі поля.';
      return;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('user_id', data.user_id);
        document.getElementById('result').innerText = 'Вхід успішний';
        window.location.href = '/index.html';
      } else {
        document.getElementById('result').innerText = data.message;
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('result').innerText = 'Помилка при вході.';
    }
  }

  static updateAuthLinks() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const authLinks = document.querySelector('.auth-links');
    if (token) {
      authLinks.innerHTML = `
        <a href="./table.html"  class="span-username">Привіт, ${username}</a>
        <span class="delimiter">|</span>
        <a href="#" onclick="Auth.logout()"  class="exit">Вийти</a>
      `;
    } else {
      authLinks.innerHTML = `
        <a href="./register.html" class="registration">Зареєструватися</a>
        <span class="delimiter">|</span>
        <a href="./login.html" class="authorization">Авторизуватися</a>
      `;
    }
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('queryHistoryData');
    window.location.href = '/index.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  Auth.updateAuthLinks();
  // Перевірка токену в URL і збереження його в localStorage
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    const username = atob(token.split('.')[1]); // Розшифровуємо токен, щоб отримати ім'я користувача
    localStorage.setItem('token', token);
    localStorage.setItem('username', JSON.parse(username).username);
    window.location.href = '/index.html'; // Редирект на головну сторінку після успішного входу
  }
});

function goToPage(selectObject) {
  var url = selectObject.value;
  if (url) {
    window.location.href = url;
  }
}
