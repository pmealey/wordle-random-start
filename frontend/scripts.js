
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

  if (dailyResult.score != null) {
    return dailyResult.score;
  }

  if (Array.isArray(dailyResult.scores)) {
    // special & lazy handling for quordle - more wordles failed should score after less wordles failed
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
  let leaderboardComments = document.getElementById('leaderboard-comments');
  let crownColumn2 = document.getElementById('crown2');
  let summaryArea = document.getElementById('summary');


  let refreshWorker = new Worker('refresh-worker.js');
  refreshWorker.onmessage = setData;

  let games = [];
  let comments = {};
  let readComments = {};

  function refreshData() {
    refreshWorker.postMessage({ type: 'refresh', date: dateInput.value });
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

  function setData(e) {
    leaderboard = {};
    clearData(summaryArea);
    let dailyResults = e.data;

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

              if (game.countWinner) {
                logResult(user, winner);
              }
            });
        });

      summaryArea.appendChild(gameContainer);
    });

    resultsArea.classList.remove('hidden');

    displayLeaderboard();

    checkForUnreadComments();
  }

  function getCommentButtonName(category) {
    return category.replace(' ', '-').toLowerCase() + '-comments';
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

    let commentButton = document.createElement('button');
    commentButton.innerHTML = '&#x1F4AC' // 💬
    commentButton.addEventListener('click', createViewCommentsHandler(game.gameName, !!dailyResult))
    commentButton.id = getCommentButtonName(game.gameName);
    row1.appendChild(commentButton);

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

  function checkForUnreadComments(category) {
    if (!category) {
      for(let category in comments) {
        checkForUnreadComments(category);
      }
      return;
    }

    if (!comments[category]) {
      return;
    }

    readComments[category] = readComments[category] || [];
    let categoryHasUnreadComments = false;

    for (let comment of comments[category]) {
      if (!readComments[category].includes(comment.id)) {
        categoryHasUnreadComments = true;
      }
    }

    let button = document.getElementById(getCommentButtonName(category));
    if (categoryHasUnreadComments) {
      button.classList.add('unread-comments');
    } else {
      button.classList.remove('unread-comments');
    }
  }

  function getComments(category, renderComments) {
    if (!dateInput.value) return;

    if (category == null) {
      let commentsRequest = new XMLHttpRequest();
      commentsRequest.onreadystatechange = function () {
        if (requestHasSucceeded(commentsRequest)) {
          comments = JSON.parse(commentsRequest.responseText);
        }
      }

      commentsRequest.open('GET', '/api/wordle/comments/' + dateInput.value, true);
      commentsRequest.send();
    } else if (appendComments != null) {
      let commentsRequest = new XMLHttpRequest();
      commentsRequest.onreadystatechange = function () {
        if (requestHasSucceeded(commentsRequest)) {
          comments[category] = JSON.parse(commentsRequest.responseText);
          renderComments();
          checkForUnreadComments(category);
        }
      }

      commentsRequest.open('GET', '/api/wordle/comments/' + dateInput.value + '/' + encodeURIComponent(category), true);
      commentsRequest.send();
    }
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

        let resultsInput = document.createElement('div');
        resultsInput.contentEditable = true;
        resultsInput.id = 'results';
        resultsInput.enterKeyHint = 'done';

        let submit = () => submitResult(dialogBody.parentElement.parentElement, resultsInput)

        // submit when clicking submit, when pressing enter, or when pasting into the text area
        resultsInput.addEventListener('keypress', (ev) => ev.key == 'Enter' ? event.preventDefault() : undefined);
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
      },
      (dialogFooter, dialogBody) => {
        let submitButton = document.createElement('button');
        let resultsInput = dialogBody.querySelector('#results');
        submitButton.addEventListener('click', () => submitResult(dialogBody.parentElement.parentElement, resultsInput));
        submitButton.textContent = 'Submit';
        dialogFooter.appendChild(submitButton);
      },
      () => {
        let resultsInput = document.getElementById('results');
        resultsInput.focus();
      }
    )
  }

  function createViewCommentsHandler(category, playedGame) {
    return () => {
      createAndAttachDialog(
        category,
        (dialogBody) => {
          if (playedGame) {
            dialogBody.classList.add('played-game');
          }

          firstUnread = appendComments(dialogBody, category, playedGame);
        },
        (dialogFooter, dialogBody) => {
          let commentInputContainer = document.createElement('form');
          commentInputContainer.classList.add('comment-input');
          commentInputRow1 = document.createElement('div');

          let commentTextarea = document.createElement('textarea');
          let submitCommentButton = document.createElement('button');
          submitCommentButton.innerHTML = '	&#x27a4;' // ➤
          submitCommentButton.type = 'submit';

          commentInputRow1.appendChild(commentTextarea);
          commentInputRow1.appendChild(submitCommentButton);
          commentInputContainer.appendChild(commentInputRow1);

          let postGameCheckbox;
          if (playedGame) {
            postGameCheckbox = document.createElement('input');
            postGameCheckbox.type = 'checkbox';

            let postGameCheckboxText = document.createElement('span');
            postGameCheckboxText.textContent = 'Share with everyone';

            let postGameCheckboxLabel = document.createElement('label');
            postGameCheckboxLabel.appendChild(postGameCheckboxText);
            postGameCheckboxLabel.appendChild(postGameCheckbox);

            commentInputRow2 = document.createElement('div');
            commentInputRow2.appendChild(postGameCheckboxLabel);
            commentInputContainer.appendChild(commentInputRow2);
          }

          commentInputContainer.addEventListener('submit', createSubmitCommentHandler(dialogBody, category, commentTextarea, postGameCheckbox, playedGame))

          dialogFooter.appendChild(commentInputContainer);
        },
        (dialog) => {
          let commentTextarea = dialog.querySelector('textarea')
          commentTextarea.focus();
          disableScroll();
        });
    }
  }

  function appendComments(dialogBody, category, playedGame) {
    clearData(dialogBody);

    let relevantComments = comments[category] || [];
    readComments[category] = readComments[category] || []

    let hiddenComments = false;
    let firstUnread = null;

    relevantComments.forEach(comment => {
      if (!playedGame && comment.postGame) {
        hiddenComments = true;
        return;
      }

      let commentRow = document.createElement('div');
      commentRow.classList.add('comment-row');

      if (comment.postGame) {
        commentRow.classList.add('post-game');
      }

      let commentContainer = document.createElement('div');
      commentContainer.classList.add('comment');
      commentContainer.style.backgroundColor = stringToColor(comment.user);

      if (comment.user === userInput.value) {
        commentRow.classList.add('mine');
      }

      let user = document.createElement('div');
      user.classList.add('user');
      user.textContent = comment.user;
      commentContainer.appendChild(user);

      let commentText = document.createElement('div');
      commentText.classList.add('comment-text');
      commentText.textContent = comment.commentText;
      commentContainer.appendChild(commentText);

      commentRow.appendChild(commentContainer);

      dialogBody.appendChild(commentRow);

      if (!readComments[category].includes(comment.id)) {
        firstUnread = commentRow;
        readComments[category].push(comment.id);
      }
    });

    if (hiddenComments) {
      let hiddenComments = document.createElement('div');
      hiddenComments.classList.add('hidden-comments');
      hiddenComments.textContent = 'Some comments are hidden. Complete today\'s game to see them!';

      let hiddenCommentsRow = document.createElement('div');
      hiddenCommentsRow.classList.add('comment-row');
      hiddenCommentsRow.appendChild(hiddenComments);
      dialogBody.appendChild(hiddenCommentsRow);
    }

    checkForUnreadComments(category);
    setCache();

    return firstUnread;
  }

  let submittingComment = false;

  function createSubmitCommentHandler(dialogBody, category, commentTextarea, postGameCheckbox, playedGame) {
    return (event) => {
      event.preventDefault();

      if (!commentTextarea.value || !dateInput.value || !userInput.value || submittingComment) {
        return false;
      }

      submittingComment = true;

      let postGame = !postGameCheckbox?.checked && playedGame;

      let submitRequest = new XMLHttpRequest();
      submitRequest.onreadystatechange = function () {
        if (requestHasSucceeded(submitRequest)) {
          if (postGameCheckbox) postGameCheckbox.checked = false;
          getComments(category, () => appendComments(dialogBody, category, playedGame));
          commentTextarea.value = null;
          submittingComment = false;
        }
      };

      submitRequest.open('POST', '/api/wordle/comments/' + dateInput.value + '/' + encodeURIComponent(category) +  '/' + userInput.value);
      submitRequest.setRequestHeader('Content-Type', 'application/json');
      submitRequest.send(JSON.stringify({
        commentText: commentTextarea.value,
        postGame: postGame
      }));

      return false;
    };
  }

  function clearCache() {
    localStorage.setItem('readComments', null);
  }

  function initializeFromCache() {
    readComments = JSON.parse(localStorage.getItem('readComments')) || {};
  }

  function setCache() {
    localStorage.setItem('readComments', JSON.stringify(readComments));
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

    getComments();
    refreshData();

    if (localStorage.getItem('today') !== dateInput.value) {
      clearCache();
      localStorage.setItem('today', dateInput.value)
    }

    initializeFromCache();
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

    submitRequest.open('PUT', url, true);
    submitRequest.setRequestHeader('Content-Type', 'application/json');
    submitRequest.send(JSON.stringify(resultsInput.innerText));
  }

  leaderboardComments.addEventListener('click', createViewCommentsHandler('Leaderboard', false));
  startSubmitButton.addEventListener('click', startSubmit);

  function setClipboard(dailyResult) {
    navigator.clipboard.writeText(dailyResult.result);
  }
})();
