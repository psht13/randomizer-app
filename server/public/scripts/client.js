let currentPage = 0;
const itemsPerPage = 10;

function getQueryHTML(randomQueryData, requestDateString) {
  let queryHTML = '';
  if (randomQueryData.queryType === 'sequence') {
    queryHTML = `
        <ul id="of">
          <li>Тип запиту: Sequence</li>
          <li>Min: ${randomQueryData.input.min}</li>
          <li>Max: ${randomQueryData.input.max}</li>
          <li>Кількість: ${randomQueryData.input.quantity}</li>
          <li id="result-q">Результат: ${randomQueryData.output}</li>
          <li>Час запиту: ${requestDateString}</li>
        </ul>
      `;
  } else if (randomQueryData.queryType === 'random') {
    queryHTML = `
        <ul id="of">
          <li>Тип запиту: Random</li>
          <li>Min: ${randomQueryData.input.min}</li>
          <li>Max: ${randomQueryData.input.max}</li>
        <li id="result-q">Результат: ${randomQueryData.output}</li>
        <li>Час запиту: ${requestDateString}</li>
        </ul>
      `;
  } else if (randomQueryData.queryType === 'randomWord') {
    queryHTML = `
        <ul id="of">
          <li>Тип запиту: Random Word</li>
          <li>Ввід: ${randomQueryData.input.text}</li>
          <li id="result-q">Результат: ${randomQueryData.output}</li>
          <li>Час запиту: ${requestDateString}</li>
          </ul>
      `;
  } else if (randomQueryData.queryType === 'generatePassword') {
    queryHTML = `
        <ul id="of">
          <li>Тип запиту: Generate Password</li>
          <li>Довжина: ${randomQueryData.input.length}</li>
          <li id="result-q">Результат: ${randomQueryData.output}</li>
          <li>Час запиту: ${requestDateString}</li>
          </ul>
      `;
  } else if (randomQueryData.queryType === 'generatePasswords') {
    queryHTML = `
        <ul id="of">
          <li>Тип запиту: Generate Passwords</li>
          <li>Кількість: ${randomQueryData.input.quantity}</li>
          <li>Довжина: ${randomQueryData.input.length}</li>
          <li id="result-q">Результат: ${randomQueryData.output.join(
            '; <br><br>'
          )}</li>
          <li>Час запиту: ${requestDateString}</li>
          </ul>
      `;
  } else {
    console.error(`Unknown query type: ${randomQueryData.queryType}`);
  }
  return queryHTML;
}

async function getRandomQueryFromHistory() {
  const userId = localStorage.getItem('user_id'); // Assume you have a function to get the current user ID
  const queryDisplay = document.getElementById('random-query-display');
  const randomQueryButton = document.getElementById('random-query-button'); // Додайте ідентифікатор кнопки
  if (isQueryVisible) {
    queryDisplay.innerHTML = '';
    isQueryVisible = false;
    //randomQueryButton.style.display = 'block'; // Показуємо кнопку знову
    return;
  }

  try {
    const response = await fetch('/getRandomQueryFromHistory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    let randomQuery = await response.json();
    const queryDisplay = document.getElementById('random-query-display-result');
    if (!queryDisplay) {
      console.error('Query display element not found');
      return;
    }
    const randomIndex = Math.floor(Math.random() * randomQuery.requests.length);
    const randomQueryData = randomQuery.requests[randomIndex];
    let queryHTML = '';
    const requestDateString = new Date(
      randomQueryData.request_time
    ).toLocaleString();
    console.log(requestDateString);
    queryHTML = getQueryHTML(randomQueryData, requestDateString);

    queryDisplay.innerHTML = queryHTML;
    //randomQueryButton.style.display = 'none'; // Приховуємо кнопку, коли відображається випадковий запит
  } catch (error) {
    console.error(error);
  }
}

function displayData(data) {
  const container = document.getElementById('data-container');
  container.innerHTML = '';

  // Apply filters
  const filteredData = filterData(data);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  data.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'data-item';

    const requestDate = new Date(item.request_time).toLocaleString();

    itemDiv.innerHTML = `
        <p><strong>Request Time:</strong> ${requestDate}, <strong>Query Type:</strong> ${
      item.queryType
    }</p>
        <div class="data-details" style="display: none;">
          ${getQueryDetailsHTML(item)}
          <p><strong>Output:</strong> ${item.output}</p>
        </div>
      `;

    itemDiv.addEventListener('click', () => {
      const details = itemDiv.querySelector('.data-details');
      details.style.display =
        details.style.display === 'none' ? 'block' : 'none';
    });

    container.appendChild(itemDiv);
  });
}

function getQueryDetailsHTML(item) {
  let detailsHTML = '';
  switch (item.queryType) {
    case 'sequence':
      detailsHTML = `
          <p><strong>Input:</strong> Quantity - ${item.input.quantity}, Min: ${item.input.min}, Max: ${item.input.max}</p>
        `;
      break;
    case 'random':
      detailsHTML = `
          <p><strong>Input:</strong> Min: ${item.input.min}, Max: ${item.input.max}</p>
        `;
      break;
    case 'randomWord':
      detailsHTML = `
          <p><strong>Input:</strong> Text: ${item.input.text}</p>
        `;
      break;
    case 'generatePassword':
      detailsHTML = `
          <p><strong>Input:</strong> Length: ${item.input.length}</p>
        `;
      break;
    case 'generatePasswords':
      detailsHTML = `
          <p><strong>Input:</strong> Quantity: ${item.input.quantity}, Length: ${item.input.length}</p>
        `;
      break;
    default:
      console.error(`Unknown query type: ${item.queryType}`);
  }
  return detailsHTML;
}

function filterData(data) {
  const queryTypeFilter = document.getElementById('queryTypeFilter').value;
  const dateFilter = document.getElementById('dateFilter').value;
  const now = new Date();

  return data.filter(item => {
    const requestDate = new Date(item.request_time);
    let dateValid = true;
    if (dateFilter === 'lastHour') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      dateValid = requestDate >= oneHourAgo;
    } else if (dateFilter === 'lastDay') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      dateValid = requestDate >= oneDayAgo;
    } else if (dateFilter === 'lastWeek') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateValid = requestDate >= oneWeekAgo;
    }

    const queryTypeValid =
      queryTypeFilter === 'all' || item.queryType === queryTypeFilter;

    return dateValid && queryTypeValid;
  });
}

function applyFilters() {
  const data = JSON.parse(localStorage.getItem('queryHistoryData'));
  const filteredData = filterData(data);
  displayData(filteredData);
}

async function getQueryHistory() {
  const user_id = localStorage.getItem('user_id');

  const response = await fetch('/queryHistory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });

  const data = await response.json();
  const data_aligned = data[0].requests;
  localStorage.setItem('queryHistoryData', JSON.stringify(data_aligned)); // Save data to local storage
  applyFilters();
  updatePagination(); // Apply filters after fetching data
}

function initializeFilters() {
  document
    .getElementById('queryTypeFilter')
    .addEventListener('change', applyFilters);
  document
    .getElementById('dateFilter')
    .addEventListener('change', applyFilters);

  document.addEventListener('DOMContentLoaded', async () => {
    await getQueryHistory();
    const data = JSON.parse(localStorage.getItem('queryHistoryData'));
    displayData(data);
  });
}

// Call initializeFilters to set up event listeners and fetch initial data
initializeFilters();

async function getStatistics() {
  try {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    if (!userId) {
      console.error('User ID not found in localStorage');
      return;
    }

    const response = await fetch(`/statistics?user_id=${userId}`);
    const data = await response.json();

    // Log the data to inspect its structure
    console.log('Data:', data);

    if (
      data.userRequests &&
      typeof data.userRequests === 'object' &&
      'count' in data.userRequests &&
      'requestTypes' in data.userRequests
    ) {
      const userRequests = data.userRequests;

      const result = `
          <h3>Statistics for User: ${username}</h3>
          <p>Total Requests: ${userRequests.count}</p>
          <h4>Request Types:</h4>
          <ul>
            ${userRequests.requestTypes
              .map(type => `<li>${type._id}: ${type.count}</li>`)
              .join('')}
          </ul>
        `;
      document.getElementById('statistics-result').innerHTML = result;
    } else {
      console.error('Error: Invalid data structure', data.userRequests);
      document.getElementById('statistics-result').innerHTML =
        '<p>Error: Invalid data structure.</p>';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('statistics-result').innerHTML =
      'Error fetching statistics from server.';
  }
}
