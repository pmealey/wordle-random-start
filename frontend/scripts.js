
function advancedModeEnabled() {
  return location.search.includes('advanced=Y');
}

function requestIsDone(request) {
  return request.readyState === XMLHttpRequest.DONE && request.status >= 200 && request.status < 300;
}

function enterListener(func) {
  return function (ev) {
    if (ev.key == 'Enter') {
      func();
    }
  }
}

function getScore(dailyResult) {
  if (dailyResult.score) {
    return dailyResult.score;
  }

  if (Array.isArray(dailyResult.scores)) {
    let sum = dailyResult.scores.reduce((a, b) => a + b, 0);
    return (sum / dailyResult.scores.length) || 0;
  }

  if (dailyResult.time) {
    return new Date(dailyResult.date.replace('00:00:00', dailyResult.time)) - new Date(dailyResult.date);
  }

  return Infinity;
}

function stringToColor(str) {
  if (!str || !str.length) return '#000';
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour + '44';
}

function checkNotificationPromise() {
  try {
    Notification.requestPermission().then();
  } catch (e) {
    return false;
  }

  return true;
}

(function () {
  let startingWord = document.getElementById('starting-word');
  let notificationButton = document.getElementById('allow-notifications');
  let userArea = document.getElementById('user-area');
  let userInput = document.getElementById('user');
  let setUserButton = document.getElementById('set-user');
  let clearUserButton = document.getElementById('clear-user');
  let dateArea = document.getElementById('date-area');
  let dateInput = document.getElementById('date');
  let refreshButton = document.getElementById('refresh');
  let resultIdArea = document.getElementById('result-id-area');
  let resultIdInput = document.getElementById('result-id');
  let viewButton = document.getElementById('view');
  let deleteArea = document.getElementById('delete-area');
  let deleteButton = document.getElementById('delete');
  let resultsArea = document.getElementById('results-area');
  let resultsTextarea = document.getElementById('results');
  let submitButton = document.getElementById('submit');
  let summaryArea = document.getElementById('summary');

  let summaries = [];

  if (advancedModeEnabled()) {
    clearUserButton.classList.remove('hidden');
    dateArea.classList.remove('hidden');
    deleteArea.classList.remove('hidden');
    resultIdArea.classList.remove('hidden');

    clearUserButton.addEventListener('click', function () {
      userInput.value = '';
      localStorage.removeItem('user');
      refreshData();
    });

    deleteButton.addEventListener('click', function () {
      if (!userInput.value && !resultIdInput.value) {
        return;
      }

      let warningMessage = 'Are you sure you would like to ';

      if (resultIdInput.value) {
        warningMessage += 'delete result ' + resultIdInput.value.toString() + '?';
      } else {
        warningMessage += 'delete all results for user ' + userInput.value;

        if (dateInput.value) {
          warningMessage += ' on ' + dateInput.value;
        }

        warningMessage += '?';
      }

      if (!confirm(warningMessage)) {
        return;
      }

      let deleteRequest = new XMLHttpRequest();
      deleteRequest.onreadystatechange = function () {
        if (requestIsDone(deleteRequest)) {
          refreshData();
        }
      }

      let url = '/api/wordle/daily-result/';

      if (resultIdInput.value) {
        url += resultIdInput.value;
      } else {
        url += userInput.value;

        if (dateInput.value) {
          url += '/' + dateInput.value;
        }
      }

      deleteRequest.open('DELETE', url, false);
      deleteRequest.send();
    });

    refreshButton.addEventListener('click', refreshData);
    dateInput.addEventListener('keyup', enterListener(refreshData));

    viewButton.addEventListener('click', viewResult);
    resultIdInput.addEventListener('keyup', enterListener(viewResult));
  }

  function initializeWorker() {
    let worker = new Worker('worker.js');

    worker.onmessage = function() {
      refreshData(true);
    };
  }

  function askNotificationPermission() {
    // function to actually ask the permissions
    function handlePermission(permission) {
      // set the button to shown or hidden, depending on what the user answers
      if (Notification.permission === 'denied' || Notification.permission === 'default') {
        notificationButton.style.display = 'block';
      } else {
        notificationButton.style.display = 'none';
        initializeWorker();
      }
    }
  
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log("This browser does not support notifications.");
    } else {
      if (checkNotificationPromise()) {
        Notification.requestPermission()
          .then((permission) => {
            handlePermission(permission);
          });
      } else {
        Notification.requestPermission(function (permission) {
          handlePermission(permission);
        });
      }
    }
  }
  
  function addGameLink(summary, container) {
    if (summary.dailyResult) {
      let textContainer = document.createElement('div');
      textContainer.innerText = summary.gameName;
      container.appendChild(textContainer);
    } else if (summary.url) {
      let link = document.createElement('a');
      link.href = summary.url;
      link.target = '_blank';
      link.innerText = 'Play ' + summary.gameName;
      container.appendChild(link);
    } else {
      let textContainer = document.createElement('div');
      textContainer.innerText = 'Play ' + summary.gameName;
      container.appendChild(textContainer);
    }
  }

  function addResult(summary, label, winner) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('result-wrapper');

    if (winner) {
      let winnerBorder = document.createElement('div');
      winnerBorder.classList.add('winner-border');
      wrapper.append(winnerBorder);
    }

    let outerContainer = document.createElement('div');
    outerContainer.classList.add('result');
    outerContainer.style.backgroundColor = stringToColor(summary.dailyResult.user);

    if (label) {
      let labelContainer = document.createElement('div');
      labelContainer.innerText = label;
      outerContainer.appendChild(labelContainer);
    }

    let container = document.createElement('div');

    function addLineBreak() {
      container.appendChild(document.createElement('br'));
    }

    if (summary.dailyResult) {
      outerContainer.classList.add('copyable');

      if (advancedModeEnabled()) {
        let idSpan = document.createElement('span');
        idSpan.innerText = 'ID: ' + summary.dailyResult.id.toString();
        container.appendChild(idSpan);
        addLineBreak();

        // no user is set, so we are processing all results for a date: include the user info
        if (!userInput.value) {
          let userSpan = document.createElement('span');
          userSpan.innerText = 'User: ' + summary.dailyResult.user.toString();
          container.appendChild(userSpan);
          addLineBreak();
        }

        // no date is set, so we are processing all results for a user: include the date info
        if (!dateInput.value) {
          let dateSpan = document.createElement('span');
          dateSpan.innerText = 'Date: ' + new Date(summary.dailyResult.date).toDateString().toString();
          container.appendChild(dateSpan);
          addLineBreak();
        }
      }

      let resultSpan = document.createElement('span');
      resultSpan.innerHTML = summary.dailyResult.result.replaceAll('\n', '<br>');
      container.appendChild(resultSpan);
      container.addEventListener('click', () => {
        setClipboard(summary);
      });
    } else {
      addGameLink(summary, container);
    }

    outerContainer.appendChild(container);
    wrapper.appendChild(outerContainer);

    return wrapper;
  }

  function clearData() {
    while (summaryArea.children.length) {
      let child = summaryArea.children[0];
      child.remove();
    }
  }

  function refreshData(notify) {
    if (!dateInput.value && !userInput.value || !advancedModeEnabled() && !userInput.value) {
      clearData();
      summaries = [];
      return;
    }

    let summaryRequest = new XMLHttpRequest();
    summaryRequest.onreadystatechange = function () {
      if (requestIsDone(summaryRequest)) {
        let newSummaries = JSON.parse(summaryRequest.responseText);

        if (notify) {
          let netNewSummaries = newSummaries.filter(sO => sO.dailyResult != null && !summaries.map(sI => sI.dailyResult?.id).includes(sO.dailyResult.id));
          if (netNewSummaries.length) {
            let names = netNewSummaries.map(s => s.dailyResult.user);
            let uniqueNames = names.filter((n, i) => names.indexOf(n) === i);
            let title = 'New Daily Game Results!'
            let body;
            if (uniqueNames.length === 1) {
              body = uniqueNames[0] + ' has posted their results.'
            } else {
              let allNames = uniqueNames.length === 2
                ? uniqueNames[0] + ' and ' + uniqueNames[1]
                : uniqueNames.slice(0, uniqueNames.length - 1).join(', ') + ', and ' + uniqueNames[uniqueNames.length];
              body = allNames + ' have posted their results.';
            }

            new Notification(title, { body });
          }
        }

        clearData();
        summaries = newSummaries;

        let allGames = newSummaries
          .map((summary) => summary.gameName);
        let games = allGames.filter((game, index) => allGames.indexOf(game) === index);

        games.forEach((game, index) => {
          let summariesForGame = newSummaries
            .filter((summary) => summary.gameName == game);

          let allUsersForGame = summariesForGame
            .filter((summary) => summary.dailyResult)
            .map((summary) => summary.dailyResult.user);
          let users = allUsersForGame.filter((user, index) => allUsersForGame.indexOf(user) === index);

          let mySummary = summariesForGame.find(summary => summary.dailyResult && summary.dailyResult.user === userInput.value) ||
            Object.assign({}, summariesForGame[0], { dailyResult: undefined });

          let gameContainer = document.createElement('div');
          gameContainer.classList.add('game');
          //gameContainer.style.backgroundColor = stringToColor(mySummary.gameName);
          addGameLink(mySummary, gameContainer);
          let resultsList = document.createElement('div');
          resultsList.classList.add('results');
          gameContainer.appendChild(resultsList);

          users.sort()
            .forEach((user) => {
              summariesForGame
                .filter((summary) => summary.dailyResult && summary.dailyResult.user === user)
                .forEach((summary) => {
                  let winner = Math.min(...summariesForGame.map(s => getScore(s.dailyResult))) === getScore(summary.dailyResult);
                  let container = addResult(summary, user, winner);
                  resultsList.appendChild(container);
                });
            });

          summaryArea.appendChild(gameContainer);
        });

        resultsArea.classList.remove('hidden');
      }
    }

    let url = '/api/wordle/daily-result';

    if (!viewAll && userInput.value) {
      url += '/' + userInput.value;
    }

    if (dateInput.value) {
      url += '/' + dateInput.value;
    }

    summaryRequest.open('GET', url, false);
    summaryRequest.send();
  }

  function viewResult() {
    if (!resultIdInput.value) {
      return;
    }

    let viewRequest = new XMLHttpRequest();
    viewRequest.onreadystatechange = function () {
      if (requestIsDone(viewRequest)) {
        let result = JSON.parse(viewRequest.responseText);
        alert(result.result);
      }
    }

    viewRequest.open('GET', '/api/wordle/daily-result/' + resultIdInput.value, false);
    viewRequest.send();
  }

  (function initialize() {
    let dailyWordRequest = new XMLHttpRequest();
    dailyWordRequest.onreadystatechange = function () {
      if (requestIsDone(dailyWordRequest)) {
        let response = JSON.parse(dailyWordRequest.responseText);
        startingWord.innerText = response.word;
        dateInput.value = response.date;
        userArea.classList.remove('hidden');

        let user = localStorage.getItem('user');
        if (user) {
          userInput.value = user;
        }

        refreshData();
      }
    }

    dailyWordRequest.open('GET', '/api/wordle/daily-word', false);
    dailyWordRequest.send();

    if (Notification.permission === 'default') {
      notificationButton.addEventListener('click', askNotificationPermission);
    } else {
      if (Notification.permission === 'granted') {
        initializeWorker();
      }

      notificationButton.style.display = 'none';
    }
  })();

  function setUser() {
    if (userInput.value) {
      localStorage.setItem('user', userInput.value);
    }

    refreshData();
  }

  setUserButton.addEventListener('click', setUser);
  if (advancedModeEnabled()) {
    userInput.addEventListener('keyup', enterListener(refreshData));
  } else {
    userInput.addEventListener('keyup', enterListener(setUser));
  }

  let submittingResult = false;

  function submitResult() {
    if (submittingResult || !userInput.value || !resultsTextarea.value) {
      return;
    }

    submittingResult = true;

    let submitRequest = new XMLHttpRequest();
    submitRequest.onreadystatechange = function () {
      submittingResult = submitRequest.readyState !== XMLHttpRequest.DONE;
      if (requestIsDone(submitRequest)) {
        refreshData();

        let timeout;

        // keep the content around until the user does something
        let handler = function () {
          clearTimeout(timeout);
          resultsTextarea.style.color = '';
          resultsTextarea.value = '';
          resultsTextarea.removeEventListener('blur', handler);
          resultsTextarea.removeEventListener('click', handler);
          resultsTextarea.removeEventListener('keydown', handler);
        }

        resultsTextarea.style.color = '#a0a0a0';
        timeout = setTimeout(handler, 5 * 1000);
        resultsTextarea.addEventListener('blur', handler);
        resultsTextarea.addEventListener('click', handler);
        resultsTextarea.addEventListener('keydown', handler);
      }
    }

    let url = '/api/wordle/daily-result/' + userInput.value;

    if (advancedModeEnabled() && dateInput.value) {
      url += '/' + dateInput.value;
    }

    submitRequest.open('PUT', url, false);
    submitRequest.setRequestHeader('Content-Type', 'application/json');
    submitRequest.send(JSON.stringify(resultsTextarea.value));
  }

  // submit when clicking submit, when pressing enter, or when pasting into the text area
  submitButton.addEventListener('click', submitResult);
  resultsTextarea.addEventListener('keypress', (ev) => ev.key == 'Enter' ? event.preventDefault() : undefined);
  resultsTextarea.addEventListener('keyup', enterListener(submitResult));
  resultsTextarea.addEventListener('paste', function () {
    let handler = function () {
      submitResult();
      resultsTextarea.removeEventListener('input', handler);
    }

    resultsTextarea.addEventListener('input', handler);
  });

  // attempt to try and catch pastes from gboard - if a bunch of text gets added at once, auto-submit
  let oldLength = 0;
  resultsTextarea.addEventListener('input', function () {
    let newLength = resultsTextarea.value.length;
    if (newLength - oldLength > 20) {
      submitResult();
    }
    oldLength = newLength;
  });

  function setClipboard(summary) {
    navigator.clipboard.writeText(summary.dailyResult.result);
  }
})();
