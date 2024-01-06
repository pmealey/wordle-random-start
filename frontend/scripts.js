
function advancedModeEnabled() {
  return location.search.includes('advanced=Y');
}

function requestHasSucceeded(request) {
  return requestIsDone(request) && request.status >= 200 && request.status < 300;
}

function requestIsDone(request) {
  return request.readyState === XMLHttpRequest.DONE;
}

function enterListener(func) {
  return function (ev) {
    if (ev.key == 'Enter') {
      func();
    }
  }
}

function getScore(dailyResult, golfScoring) {
  let defaultScore = golfScoring ? Infinity : 0;

  if (dailyResult.score != null && dailyResult.time != null) {
    // special and lazy handling for murdle - highest score with lowest time should win
    const time = new Date(dailyResult.date.replace('00:00:00', dailyResult.time)) - new Date(dailyResult.date);
    // each failure adds a day in seconds to the score
    return dailyResult.score * 24 * 60 * 60 + time;
  }

  if (dailyResult.score != null) {
    return dailyResult.score;
  }

  if (Array.isArray(dailyResult.scores)) {
    // special & lazy handling for quordle - more wordles failed should score after fewer wordles failed
    let sum = 100 * (4 - dailyResult.scores.length);
    sum = dailyResult.scores.reduce((a, b) => a + b, sum);
    return sum || defaultScore;
  }

  if (dailyResult.time) {
    return new Date(dailyResult.date.replace('00:00:00', dailyResult.time)) - new Date(dailyResult.date);
  }

  return defaultScore;
}

function stringToColor(str) {
  if (!str || !str.length) return '#000';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour + '44';
}

// function checkNotificationPromise() {
//   try {
//     Notification.requestPermission().then();
//   } catch (e) {
//     return false;
//   }

//   return true;
// }

(function () {
  let startSubmitButton = document.getElementById('start-submit');
  let startingWord = document.getElementById('starting-word');
  //let notificationButton = document.getElementById('allow-notifications');
  let userArea = document.getElementById('user-area');
  let userInput = document.getElementById('user');
  let setUserButton = document.getElementById('set-user');
  let dateArea = document.getElementById('date-area');
  let dateInput = document.getElementById('date');
  let refreshButton = document.getElementById('refresh');
  let resultIdArea = document.getElementById('result-id-area');
  let resultIdInput = document.getElementById('result-id');
  let viewButton = document.getElementById('view');
  let deleteArea = document.getElementById('delete-area');
  let deleteButton = document.getElementById('delete');
  let resultsArea = document.getElementById('results-area');
  let gamesList = document.getElementById('games-list');
  let crownColumn1 = document.getElementById('crown1');
  let leaderboardArea = document.getElementById('leaderboard');
  let crownColumn2 = document.getElementById('crown2');
  let summaryArea = document.getElementById('summary');

  (function () {
    const thisUrlParams = new URLSearchParams(location.search);
    if (!thisUrlParams.has('group')) {
      thisUrlParams.append('group', 'family');
      const newUrl = location.origin + location.pathname + '?' + thisUrlParams.toString();
      history.replaceState({path: newUrl}, '', newUrl);
    }
  })();

  let games = [];

  function refreshData() {
    let summaryRequest = new XMLHttpRequest();
    summaryRequest.onreadystatechange = function () {
      if (requestIsDone(summaryRequest)) {
        let newSummaries = JSON.parse(summaryRequest.responseText);
        setData(newSummaries);
      }
    }

    let url = '/api/wordle/daily-result';

    const date = dateInput.value
    if (date) {
      url += '/' + date;
    }

    const groups = getGroups();
    if (groups && groups.length) {
      const params = new URLSearchParams();
      groups.forEach(g => params.append('group', g));
      url = url + '?' + params.toString();
    }

    summaryRequest.open('GET', url, false);
    summaryRequest.send();
  }

  if (advancedModeEnabled()) {
    dateArea.classList.remove('hidden');
    deleteArea.classList.remove('hidden');
    resultIdArea.classList.remove('hidden');

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
        if (requestHasSucceeded(deleteRequest)) {
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

      deleteRequest.open('DELETE', url, true);
      deleteRequest.send();
    });

    refreshButton.addEventListener('click', refreshData);
    dateInput.addEventListener('keyup', enterListener(refreshData));

    viewButton.addEventListener('click', viewResult);
    resultIdInput.addEventListener('keyup', enterListener(viewResult));
  }

  let leaderboard = {};

  function logResult(user, winner) {
    leaderboard[user] = leaderboard[user] || 0;
    if (winner) {
      leaderboard[user]++;
    }
  }

  function createCrown() {
    let crown = document.createElement('div');
    crown.innerHTML = '&#x1F451;'; // 👑
    crown.classList.add('crown');
    return crown;
  }

  function displayLeaderboard() {
    clearData(leaderboardArea);
    clearData(crownColumn1);
    clearData(crownColumn2);

    let leaderboardByWinner = [];
    for (let user in leaderboard) {
      leaderboardByWinner.push({
        user,
        wins: leaderboard[user]
      });
    }

    leaderboardByWinner = leaderboardByWinner.sort((a, b) => b.wins - a.wins);

    let topScore = 0;

    leaderboardByWinner.forEach((entry, i)=> {
      if (i === 0) topScore = entry.wins;
      let winner = entry.wins === topScore;

      let wrapper = document.createElement('div');
      wrapper.classList.add('leaderboard-wrapper');

      let name = document.createElement('div');
      name.textContent = entry.user;
      wrapper.appendChild(name);

      let wins = document.createElement('div');
      wins.textContent = entry.wins.toString();
      wrapper.appendChild(wins);

      if (winner) {
        crownColumn1.appendChild(createCrown());
        crownColumn2.appendChild(createCrown());
      }

      leaderboardArea.appendChild(wrapper);
    });
  }

  function setData(dailyResults) {
    leaderboard = {};
    clearData(summaryArea);

    games.forEach((game) => {
      let dailyResultsForGame = dailyResults
        .filter((dailyResult) => dailyResult.game == game.gameName);

      let allUsersForGame = dailyResultsForGame
        .map((dailyResult) => dailyResult.user);
      let users = allUsersForGame.filter((user, index) => allUsersForGame.indexOf(user) === index);

      let myDailyResult = dailyResultsForGame.find(dailyResult => dailyResult.user === userInput.value);

      let gameContainer = document.createElement('div');
      gameContainer.classList.add('game');
      if (game.countWinner) {
        gameContainer.classList.add('count-winner');
      }

      if (allUsersForGame.length > 1) {
        gameContainer.classList.add('competitive');
      }

      addGameLink(game, myDailyResult, gameContainer);
      let resultsList = document.createElement('div');
      resultsList.classList.add('results');
      gameContainer.appendChild(resultsList);

      users.sort()
        .forEach((user) => {
          dailyResultsForGame
            .filter((dailyResult) => dailyResult.user === user)
            .forEach((dailyResult) => {
              let scores = dailyResultsForGame.map(dr => getScore(dr, game.golfScoring));
              let winner = (game.golfScoring ? Math.min(...scores) : Math.max(...scores)) === getScore(dailyResult, game.golfScoring);
              let container = addResult(game, dailyResult, user, winner);
              resultsList.appendChild(container);

              if (game.countWinner && scores.length > 1) {
                logResult(user, winner);
              }
            });
        });

      summaryArea.appendChild(gameContainer);
    });

    resultsArea.classList.remove('hidden');

    displayLeaderboard();
  }

  function addGameLink(game, dailyResult, container) {
    let header = document.createElement('div');
    header.classList.add('game-header');

    let row1 = document.createElement('div');
    header.appendChild(row1);

    if (dailyResult) {
      let textContainer = document.createElement('a');
      textContainer.innerText = game.gameName;
      row1.appendChild(textContainer);
    } else if (game.url) {
      let link = document.createElement('a');
      link.href = game.url;
      link.target = '_blank';
      link.innerText = 'Play ' + game.gameName;
      row1.appendChild(link);
    } else {
      let textContainer = document.createElement('div');
      textContainer.innerText = 'Play ' + game.gameName;
      row1.appendChild(textContainer);
    }

    if (game.helpText) {
      let helpText = document.createElement('div');
      helpText.classList.add('help');
      helpText.textContent = game.helpText;

      let row2 = document.createElement('div');
      row2.appendChild(helpText);
      header.appendChild(row2);
    }

    container.appendChild(header);
  }

  function addResult(game, dailyResult, label, winner) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('result-wrapper');

    if (game.countWinner && winner) {
      let winnerBorder = document.createElement('div');
      winnerBorder.classList.add('winner-border');
      wrapper.append(winnerBorder);
    }

    let outerContainer = document.createElement('div');
    outerContainer.classList.add('result');
    outerContainer.style.backgroundColor = stringToColor(dailyResult.user);

    if (label) {
      let labelContainer = document.createElement('div');
      labelContainer.innerText = label;
      outerContainer.appendChild(labelContainer);
    }

    let container = document.createElement('div');

    function addLineBreak() {
      container.appendChild(document.createElement('br'));
    }

    outerContainer.classList.add('copyable');

    if (advancedModeEnabled()) {
      let idSpan = document.createElement('span');
      idSpan.innerText = 'ID: ' + dailyResult.id.toString();
      container.appendChild(idSpan);
      addLineBreak();
    }

    let resultSpan = document.createElement('span');
    resultSpan.innerHTML = dailyResult.result.replaceAll('\n', '<br>');
    container.appendChild(resultSpan);
    container.addEventListener('click', () => {
      setClipboard(dailyResult);
    });

    outerContainer.appendChild(container);
    wrapper.appendChild(outerContainer);

    return wrapper;
  }

  function clearData(area) {
    while (area.children.length) {
      let child = area.children[0];
      child.remove();
    }
  }

  function viewResult() {
    if (!resultIdInput.value) {
      return;
    }

    let viewRequest = new XMLHttpRequest();
    viewRequest.onreadystatechange = function () {
      if (requestHasSucceeded(viewRequest)) {
        let result = JSON.parse(viewRequest.responseText);
        alert(result.result);
      }
    }

    viewRequest.open('GET', '/api/wordle/daily-result/' + resultIdInput.value, true);
    viewRequest.send();
  }

  function disableScroll() {
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.position = 'fixed';
  }

  function enableScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }

  function createAndAttachDialog(dialogTitleText, populateDialogBody, populateDialogFooter, afterRender) {
    let dialogOverlay = document.createElement('div');
    dialogOverlay.classList.add('dialog-overlay');

    let dialog = document.createElement('div');
    dialog.classList.add('dialog');

    let dialogTitle = document.createElement('h4');
    dialogTitle.textContent = dialogTitleText;

    let closeDialogButton = document.createElement('button');
    closeDialogButton.innerHTML = '&#x274c;' // ❌
    closeDialogButton.addEventListener('click', () => {
      dialogOverlay.remove();
      enableScroll();
    });

    let dialogHeader = document.createElement('div');
    dialogHeader.classList.add('dialog-header');
    dialogHeader.appendChild(dialogTitle);
    dialogHeader.appendChild(closeDialogButton);
    dialog.appendChild(dialogHeader);

    let dialogBody = document.createElement('div');
    dialogBody.classList.add('dialog-body');
    populateDialogBody(dialogBody);
    dialog.appendChild(dialogBody);

    let dialogFooter = document.createElement('div');
    dialogFooter.classList.add('dialog-footer');
    populateDialogFooter(dialogFooter, dialogBody);
    dialog.appendChild(dialogFooter);

    dialogOverlay.appendChild(dialog);
    document.body.appendChild(dialogOverlay);

    setTimeout(() => afterRender(dialog));
  }

  function startSubmit() {
    createAndAttachDialog(
      'Submit Result',
      (dialogBody) => {
        dialogBody.classList.add('results-dialog');

        let labelContainer = document.createElement('div');
        let resultsLabel = document.createElement('label');
        resultsLabel.for = 'results';
        resultsLabel.textContent = "Paste or enter your result here:";
        labelContainer.appendChild(resultsLabel);
        dialogBody.appendChild(labelContainer);

        let resultsInput = document.createElement('pre');
        resultsInput.contentEditable = true;
        resultsInput.id = 'results';
        resultsInput.enterKeyHint = 'done';

        let submit = () => submitResult(dialogBody.parentElement.parentElement, resultsInput)

        // submit when clicking submit, when pressing enter, or when pasting into the text area
        resultsInput.addEventListener('keypress', (event) => event.key == 'Enter' ? event.preventDefault() : undefined);
        resultsInput.addEventListener('keyup', enterListener(submit));
        resultsInput.addEventListener('paste', function () {
          let handler = function () {
            submit();
            resultsInput.removeEventListener('input', handler);
          }

          resultsInput.addEventListener('input', handler);
        });

        // attempt to try and catch pastes from gboard - if a bunch of text gets added at once, auto-submit
        let oldLength = 0;
        resultsInput.addEventListener('input', function () {
          let newLength = resultsInput.innerText.length;
          if (newLength - oldLength > 20) {
            submit();
          }
          oldLength = newLength;
        });

        dialogBody.appendChild(resultsInput);

        // auto-paste isn't work, maybe try it again later.
        // try {
        //   if (typeof(navigator.clipboard.readText) === 'function') {
        //     navigator.clipboard.readText().then((text) => {
        //       resultsInput.innerText = text;
        //       let focusListener = () => {
        //         resultsInput.innerText = '';
        //         resultsInput.removeEventListener('focus', focusListener);
        //       }
        //       resultsInput.addEventListener('focus', focusListener);
        //     });
        //   }
        // } catch { }
      },
      (dialogFooter, dialogBody) => {
        let submitButton = document.createElement('button');
        submitButton.addEventListener('click', () => {
          let resultsInput = dialogBody.querySelector('#results');
          submitResult(dialogBody.parentElement.parentElement, resultsInput);
        });
        submitButton.textContent = 'Submit';
        dialogFooter.appendChild(submitButton);
      },
      () => {
        let resultsInput = document.getElementById('results');
        resultsInput.focus();
        disableScroll();
      }
    )
  }

  let initialized = false;
  function initializeStep2() {
    if (!initialized) {
      initialized = true;
      return;
    }

    userArea.classList.remove('hidden');

    let user = localStorage.getItem('user');
    if (user) {
      userInput.value = user;
    }

    refreshData();

    if (localStorage.getItem('today') !== dateInput.value) {
      localStorage.setItem('today', dateInput.value)
    }
  }

  (function initialize() {
    let gamesRequest = new XMLHttpRequest();
    gamesRequest.onreadystatechange = function () {
      if (requestHasSucceeded(gamesRequest)) {
        games = JSON.parse(gamesRequest.responseText);
        let countedGames = games
          .filter(g => g.countWinner)
          .map(g => g.gameName);
        gamesList.innerText = countedGames
          .slice(0, countedGames.length - 1)
          .join(', ') + ', and ' + countedGames[countedGames.length - 1];
        initializeStep2();
      }
    }

    gamesRequest.open('GET', '/api/wordle/games', true);
    gamesRequest.send();

    let dailyWordRequest = new XMLHttpRequest();
    dailyWordRequest.onreadystatechange = function () {
      if (requestHasSucceeded(dailyWordRequest)) {
        let response = JSON.parse(dailyWordRequest.responseText);
        startingWord.innerText = response.word;
        startingWord.href = 'https://www.google.com/search?q=' + encodeURIComponent('define: ' + response.word);
        dateInput.value = response.date;
        initializeStep2();
      }
    }

    dailyWordRequest.open('GET', '/api/wordle/daily-word', true);
    dailyWordRequest.send();
  })();

  function setUser() {
    if (userInput.value) {
      localStorage.setItem('user', userInput.value);
    }

    refreshData();
  }

  setUserButton.addEventListener('click', setUser);
  userInput.addEventListener('keyup', enterListener(setUser));

  let submittingResult = false;

  function submitResult(dialogOverlay, resultsInput) {
    if (submittingResult || !userInput.value || !resultsInput.innerText) {
      return;
    }

    submittingResult = true;

    let submitRequest = new XMLHttpRequest();
    submitRequest.onreadystatechange = function () {
      if (requestIsDone(submitRequest)) {
        submittingResult = false;
      }

      if (requestHasSucceeded(submitRequest)) {
        refreshData();

        setTimeout(() => {
          dialogOverlay.remove();
          enableScroll();
        }, 250);
      }
    }

    let url = '/api/wordle/daily-result/' + userInput.value;

    if (advancedModeEnabled() && dateInput.value) {
      url += '/' + dateInput.value;
    }

    submitRequest.open('PUT', addGroupParams(url), true);
    submitRequest.setRequestHeader('Content-Type', 'application/json');
    submitRequest.send(JSON.stringify(resultsInput.innerText));
  }

  function getGroups() {
    const thisUrlParams = new URLSearchParams(location.search);
    return thisUrlParams.getAll('group').filter(Boolean);
  }

  function addGroupParams(url, newUrlParams = new URLSearchParams()) {
    const groups = getGroups();
    groups.forEach((group) => {
      newUrlParams.append('group', group);
    });

    return url + '?' + newUrlParams.toString();
  }

  startSubmitButton.addEventListener('click', startSubmit);

  function setClipboard(dailyResult) {
    navigator.clipboard.writeText(dailyResult.result);
  }
})();
