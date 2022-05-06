
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
  let resultsTextarea = document.getElementById('results');
  let submitButton = document.getElementById('submit');
  let crownColumn1 = document.getElementById('crown1');
  let leaderboardArea = document.getElementById('leaderboard');
  let leaderboardComments = document.getElementById('leaderboard-comments');
  let crownColumn2 = document.getElementById('crown2');
  let summaryArea = document.getElementById('summary');

  let refreshWorker = new Worker('refresh-worker.js');
  refreshWorker.onmessage = setData;

  let comments = {};
  let readComments = {};

  // function turnOnNotifications() {
  //   refreshWorker.postMessage({ type: 'notify', date: dateInput.value });
  // }

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
    let summaries = e.data;

    let allGames = summaries
      .map((summary) => summary.gameName);
    let games = allGames.filter((game, index) => allGames.indexOf(game) === index);

    games.forEach((game, index) => {
      let summariesForGame = summaries
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
              let scores = summariesForGame.map(s => getScore(s.dailyResult, s.golfScoring));
              let winner = (summary.golfScoring ? Math.min(...scores) : Math.max(...scores)) === getScore(summary.dailyResult, summary.golfScoring);
              let container = addResult(summary, user, winner);
              resultsList.appendChild(container);

              if (summary.countWinner) {
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

  // function askNotificationPermission() {
  //   // function to actually ask the permissions
  //   function handlePermission(permission) {
  //     // set the button to shown or hidden, depending on what the user answers
  //     if (Notification.permission === 'granted') {
  //       if (!advancedModeEnabled()) {
  //         turnOnNotifications();
  //       }

  //       notificationButton.parentElement.classList.add('hidden');
  //     }
  //   }
  
  //   // Let's check if the browser supports notifications
  //   if (!('Notification' in window)) {
  //     console.log("This browser does not support notifications.");
  //   } else {
  //     if (checkNotificationPromise()) {
  //       Notification.requestPermission()
  //         .then((permission) => {
  //           handlePermission(permission);
  //         });
  //     } else {
  //       Notification.requestPermission(function (permission) {
  //         handlePermission(permission);
  //       });
  //     }
  //   }
  // }

  function getCommentButtonName(category) {
    return category.replace(' ', '-').toLowerCase() + '-comments';
  }

  function addGameLink(summary, container) {
    let header = document.createElement('div');
    header.classList.add('game-header');

    if (summary.dailyResult) {
      let textContainer = document.createElement('a');
      textContainer.innerText = summary.gameName;
      header.appendChild(textContainer);
    } else if (summary.url) {
      let link = document.createElement('a');
      link.href = summary.url;
      link.target = '_blank';
      link.innerText = 'Play ' + summary.gameName;
      header.appendChild(link);
    } else {
      let textContainer = document.createElement('div');
      textContainer.innerText = 'Play ' + summary.gameName;
      header.appendChild(textContainer);
    }

    let commentButton = document.createElement('button');
    commentButton.innerHTML = '&#x1F4AC' // 💬
    commentButton.addEventListener('click', createViewCommentsHandler(summary.gameName, !!summary.dailyResult))
    commentButton.id = getCommentButtonName(summary.gameName);
    header.appendChild(commentButton);

    container.appendChild(header);
  }

  function addResult(summary, label, winner) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('result-wrapper');

    if (summary.countWinner && winner) {
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
      if (requestIsDone(viewRequest)) {
        let result = JSON.parse(viewRequest.responseText);
        alert(result.result);
      }
    }

    viewRequest.open('GET', '/api/wordle/daily-result/' + resultIdInput.value, false);
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
        if (requestIsDone(commentsRequest)) {
          comments = JSON.parse(commentsRequest.responseText);
        }
      }

      commentsRequest.open('GET', '/api/wordle/comments/' + dateInput.value, false);
      commentsRequest.send();
    } else if (appendComments != null) {
      let commentsRequest = new XMLHttpRequest();
      commentsRequest.onreadystatechange = function () {
        if (requestIsDone(commentsRequest)) {
          comments[category] = JSON.parse(commentsRequest.responseText);
          renderComments();
          checkForUnreadComments(category);
        }
      }

      commentsRequest.open('GET', '/api/wordle/comments/' + dateInput.value + '/' + encodeURIComponent(category), false);
      commentsRequest.send();
    }
  }

  function freeze(e) {
    if (!e.target.closest('.dialog-overlay')) {
      e.preventDefault();
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

  function createViewCommentsHandler(category, playedGame) {
    return () => {
      let dialogOverlay = document.createElement('div');
      dialogOverlay.classList.add('dialog-overlay');

      let dialog = document.createElement('div');
      dialog.classList.add('dialog');

      let dialogTitle = document.createElement('h4');
      dialogTitle.textContent = category;

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
      if (playedGame) {
        dialogBody.classList.add('played-game');
      }

      appendComments(dialogBody, category, playedGame);

      dialog.appendChild(dialogBody);

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

      let dialogFooter = document.createElement('div');
      dialogFooter.classList.add('dialog-footer');
      dialogFooter.appendChild(commentInputContainer);
      dialog.appendChild(dialogFooter);

      dialogOverlay.appendChild(dialog);
      document.body.appendChild(dialogOverlay);
      commentTextarea.focus();
      disableScroll();
    }
  }

  function appendComments(dialogBody, category, playedGame) {
    clearData(dialogBody);

    let relevantComments = comments[category] || [];
    readComments[category] = readComments[category] || []

    let hiddenComments = false;

    relevantComments.forEach(comment => {
      if (!playedGame && comment.postGame) {
        hiddenComments = true;
        return;
      }

      if (!readComments[category].includes(comment.id)) {
        readComments[category].push(comment.id);
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
        if (requestIsDone(submitRequest)) {
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

        getComments();
        refreshData();

        if (localStorage.getItem('today') !== dateInput.value) {
          clearCache();
          localStorage.setItem('today', dateInput.value)
        }

        initializeFromCache();

        // if (!advancedModeEnabled() && Notification.permission === 'granted') {
        //   turnOnNotifications();
        // }
      }
    }

    dailyWordRequest.open('GET', '/api/wordle/daily-word', false);
    dailyWordRequest.send();
  })();

  // if (Notification.permission === 'default') {
  //   notificationButton.parentElement.classList.remove('hidden');
  //   notificationButton.addEventListener('click', askNotificationPermission);
  // }

  function setUser() {
    if (userInput.value) {
      localStorage.setItem('user', userInput.value);
    }

    refreshData();
  }

  setUserButton.addEventListener('click', setUser);
  userInput.addEventListener('keyup', enterListener(setUser));

  let submittingResult = false;

  function submitResult() {
    if (submittingResult || !userInput.value || !resultsTextarea.value) {
      return;
    }

    submittingResult = true;

    let submitRequest = new XMLHttpRequest();
    submitRequest.onreadystatechange = function () {
      if (requestIsDone(submitRequest)) {
        refreshData();

        let timeout;

        // keep the content around until the user does something
        let handler = function () {
          submittingResult = false;
          clearTimeout(timeout);
          resultsTextarea.style.color = '';
          resultsTextarea.value = '';
          resultsTextarea.removeEventListener('blur', handler);
          resultsTextarea.removeEventListener('click', handler);
          resultsTextarea.removeEventListener('keydown', handler);
        }

        resultsTextarea.style.color = '#a0a0a0';
        timeout = setTimeout(handler, 2 * 1000); // 2 seconds
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

  leaderboardComments.addEventListener('click', createViewCommentsHandler('Leaderboard', false));

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
