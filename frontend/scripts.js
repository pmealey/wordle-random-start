
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

function scoreIsFailure(score, game) {
  let isFailure = game.golfScoring
    ? score === Infinity
    : score === 0;
  return isFailure;
}

function isBalatroScoreBetter(a, b) {
  // Higher is better for Balatro. Compare element by element.
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? -Infinity;
    const bv = b[i] ?? -Infinity;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return false;
}

function scoreIsWinning(score, game, scores) {
  if (game.gameName === 'Balatro Daily Challenge' && Array.isArray(score)) {
    return scores.every(other => other === score || !isBalatroScoreBetter(other, score));
  }

  return (game.golfScoring ? Math.min(...scores) : Math.max(...scores)) === score
}

function getScore(dailyResult, golfScoring) {
  let defaultScore = golfScoring ? Infinity : 0;

  if (dailyResult.game === 'Balatro Daily Challenge') {
    return dailyResult.scores;
  }

  if (dailyResult.score != null && dailyResult.time != null && (dailyResult.game === 'Murdle' || dailyResult.game === 'Clues by Sam')) {
    // the score in clues by sam is the number of green suspects - 20 minus the score is the number of failures
    const failures = dailyResult.game === 'Clues by Sam' ? 20 - dailyResult.score : dailyResult.score;
    // special and lazy handling for murdle & clues by sam - highest score with lowest time should win
    const time = new Date(dailyResult.date.replace('00:00:00', dailyResult.time)) - new Date(dailyResult.date);
    // each failure adds a day in milliseconds to the score
    return failures * 24 * 60 * 60 * 1000 + time;
  }

  if (dailyResult.score != null) {
    return dailyResult.score;
  }

  if (Array.isArray(dailyResult.scores)) {
    if (dailyResult.game === 'Quordle' || dailyResult.game === 'Sedecordle') {
      // special & lazy handling for quordle & sedecordle - more wordles failed should score after fewer wordles failed
      const totalGames = dailyResult.game === 'Quordle' ? 4 : 16;
      let sum = 1000 * (totalGames - dailyResult.scores.length);
      sum = dailyResult.scores.reduce((a, b) => a + b, sum);
      return sum || defaultScore;
    } else if (dailyResult.game === 'Contexto' || dailyResult.game === 'Pimantle') {
      // special and lazy handling for contexto and pimantle - hints push scores into higher tiers
      if (dailyResult.scores.length === 2) {
        return dailyResult.scores[0] * 10000 + dailyResult.scores[1];
      } else if (dailyResult.scores.length === 1) {
        return dailyResult.scores[0];
      } else {
        return defaultScore;
      }
    } else if (dailyResult.game === 'Rogule') {
      // special and lazy handling for Rogule - treasure > foes > faster > health
      const treasure = dailyResult.scores[0].toString();
      const foes = dailyResult.scores[1].toString().padStart(2, '0');
      const steps = (9999 - dailyResult.scores[2]).toString().padStart(4, '0');
      const health = dailyResult.scores[3].toString();
      // VVWWXXYYYYZ, V = treasure, W = foes, X = steps, Y = steps, Z = health
      return +(treasure + foes + steps + health);
    }
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
  let titleSpan = document.getElementById('title');
  let todaySpan = document.getElementById('today');
  let startingWord = document.getElementById('starting-word');
  //let notificationButton = document.getElementById('allow-notifications');
  let userArea = document.getElementById('user-area');
  let userInput = document.getElementById('user');
  let setUserButton = document.getElementById('set-user');
  let setGroupButton = document.getElementById('set-group');
  let groupArea = document.getElementById('group-area');
  let groupInput = document.getElementById('group');
  let dateArea = document.getElementById('date-area');
  let dateInput = document.getElementById('date');
  let refreshButton = document.getElementById('refresh');
  let resultIdArea = document.getElementById('result-id-area');
  let resultIdInput = document.getElementById('result-id');
  let viewButton = document.getElementById('view');
  let deleteArea = document.getElementById('delete-area');
  let deleteButton = document.getElementById('delete');
  let noUserOrGroupArea = document.getElementById('no-user-or-group-area');
  let groupSelectionArea = document.getElementById('group-selection-area');
  let resultsArea = document.getElementById('results-area');
  let leaderboardContainer = document.getElementById('leaderboard-container');
  let crownColumn1 = document.getElementById('crown1');
  let leaderboardArea = document.getElementById('leaderboard');
  let crownColumn2 = document.getElementById('crown2');
  let groupDescription = document.getElementById('group-description');
  let summaryArea = document.getElementById('summary');
  let errorArea = document.getElementById('error-area');
  let settingsCard = document.getElementById('settings-card');
  let toggleSettingsButton = document.getElementById('toggle-settings');
  let closeSettingsButton = document.getElementById('close-settings');
  let leaderboardSummary = document.getElementById('leaderboard-summary');
  let displaySummary = document.getElementById('display-summary');
  let sortSummary = document.getElementById('sort-summary');
  let leaderboardCountInput = document.getElementById('leaderboard-count');

  let games = [];

  let group = {};

  let groups = {};

  let settingsAreOpen = false;
  let leaderboardStateWhenSettingsOpened = null;

  // Settings management
  function getLeaderboardSettings(groupName) {
    const key = `leaderboard_${groupName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Defaults: family gets 'top', others get 'all'
    const isFamily = groupName && groupName.includes('family');
    return {
      mode: isFamily ? 'top' : 'all',
      count: 6
    };
  }

  function saveLeaderboardSettings(groupName, settings) {
    const key = `leaderboard_${groupName}`;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  function getGamesDisplay() {
    return localStorage.getItem('gamesDisplay') || 'all';
  }

  function saveGamesDisplay(value) {
    localStorage.setItem('gamesDisplay', value);
  }

  function getGamesSort() {
    return localStorage.getItem('sort') || 'popularity';
  }

  function saveGamesSort(value) {
    localStorage.setItem('sort', value);
  }

  function getLeaderboardModeLabel(settings) {
    if (settings.mode === 'top') {
      return `Top ${settings.count}`;
    } else if (settings.mode === 'my') {
      return 'Mine';
    } else if (settings.mode === 'hidden') {
      return 'Off';
    } else {
      return 'All';
    }
  }

  function getDisplayLabel(display) {
    if (display === 'popular') {
      return 'Popular';
    } else if (display === 'my') {
      return 'Mine';
    } else {
      return 'All';
    }
  }

  function getSortLabel(sort) {
    if (sort === 'arbitrary') {
      return 'Arbitrary';
    } else if (sort === 'popularity') {
      return 'Popular';
    } else if (sort === 'personal') {
      return 'Mine';
    } else {
      return 'A-Z';
    }
  }

  function updateSettingsSummary() {
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup) return;

    const leaderboardSettings = getLeaderboardSettings(selectedGroup);
    const display = getGamesDisplay();
    const sort = getGamesSort();

    leaderboardSummary.textContent = `🏆 ${getLeaderboardModeLabel(leaderboardSettings)}`;
    displaySummary.textContent = `📋 ${getDisplayLabel(display)}`;
    sortSummary.textContent = `↕️ ${getSortLabel(sort)}`;
  }

  function updateSettingsCard() {
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup) return;

    const leaderboardSettings = getLeaderboardSettings(selectedGroup);
    const display = getGamesDisplay();
    const sort = getGamesSort();

    // Update leaderboard mode
    document.querySelector(`input[name="leaderboard-mode"][value="${leaderboardSettings.mode}"]`).checked = true;
    leaderboardCountInput.value = leaderboardSettings.count;
    leaderboardCountInput.disabled = leaderboardSettings.mode !== 'top';

    // Update games display
    document.querySelector(`input[name="games-display"][value="${display}"]`).checked = true;

    // Update sort
    document.querySelector(`input[name="games-sort"][value="${sort}"]`).checked = true;
  }

  function updateLeaderboardVisibility() {
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup) return;

    const leaderboardSettings = getLeaderboardSettings(selectedGroup);
    const currentStateIsHidden = leaderboardSettings.mode === 'hidden';
    
    if (!settingsAreOpen) {
      // Settings closed - apply final state
      if (currentStateIsHidden) {
        leaderboardContainer.classList.remove('hidden-preserve-space');
        leaderboardContainer.classList.add('hidden');
      } else {
        leaderboardContainer.classList.remove('hidden', 'hidden-preserve-space');
      }
    } else {
      // Settings open - only modify if state changed
      if (currentStateIsHidden !== leaderboardStateWhenSettingsOpened) {
        if (leaderboardStateWhenSettingsOpened === false) {
          // Was visible, now hidden - hide content but preserve space
          leaderboardContainer.classList.remove('hidden');
          leaderboardContainer.classList.add('hidden-preserve-space');
        }
        // If was hidden, now visible - keep it hidden (display: none), don't preserve space
        // Do nothing - it stays in display: none
      }
      // If state hasn't changed, don't modify anything
    }
  }

  function toggleSettingsCard() {
    if (settingsCard.classList.contains('hidden')) {
      // Opening settings - track initial state, don't change anything visually
      const selectedGroup = getSelectedGroup();
      const leaderboardSettings = getLeaderboardSettings(selectedGroup);
      leaderboardStateWhenSettingsOpened = leaderboardSettings.mode === 'hidden';
      settingsAreOpen = true;
      
      settingsCard.classList.remove('hidden');
      setTimeout(() => settingsCard.classList.add('expanded'), 10);
      updateSettingsCard();
    } else {
      // Closing settings
      settingsCard.classList.remove('expanded');
      setTimeout(() => {
        settingsCard.classList.add('hidden');
        settingsAreOpen = false;
        leaderboardStateWhenSettingsOpened = null;
        
        // Apply final leaderboard state
        updateLeaderboardVisibility();
        
        // Regenerate leaderboard if it's now visible
        const selectedGroup = getSelectedGroup();
        const leaderboardSettings = getLeaderboardSettings(selectedGroup);
        if (leaderboardSettings.mode !== 'hidden' && lastDailyResults) {
          displayLeaderboard();
        }
      }, 300);
    }
  }

  function closeSettingsCard() {
    settingsCard.classList.remove('expanded');
    setTimeout(() => {
      settingsCard.classList.add('hidden');
      settingsAreOpen = false;
      leaderboardStateWhenSettingsOpened = null;
      
      // Apply final leaderboard state
      updateLeaderboardVisibility();
      
      // Regenerate leaderboard if it's now visible
      const selectedGroup = getSelectedGroup();
      const leaderboardSettings = getLeaderboardSettings(selectedGroup);
      if (leaderboardSettings.mode !== 'hidden' && lastDailyResults) {
        displayLeaderboard();
      }
    }, 300);
  }

  function filterGamesForLeaderboard(allGames, leaderboardSettings) {
    if (leaderboardSettings.mode === 'hidden') {
      return [];
    } else if (leaderboardSettings.mode === 'all') {
      return allGames;
    } else if (leaderboardSettings.mode === 'my') {
      return allGames.filter(game => game.myPopularity > 0);
    } else if (leaderboardSettings.mode === 'top') {
      // Sort by group popularity and take top N
      return allGames
        .filter(game => group.games && group.games[game.gameName])
        .sort((a, b) => group.games[b.gameName].popularity - group.games[a.gameName].popularity)
        .slice(0, leaderboardSettings.count);
    }
    return allGames;
  }

  function filterGamesForDisplay(allGames, displayMode) {
    if (displayMode === 'all') {
      return allGames;
    } else if (displayMode === 'my') {
      return allGames.filter(game => game.myPopularity > 0);
    } else if (displayMode === 'popular') {
      return allGames.filter(game => group.games && group.games[game.gameName] && group.games[game.gameName].popularity > 0);
    }
    return allGames;
  }

  function shouldCountForLeaderboard(gameName, leaderboardGames) {
    return leaderboardGames.some(g => g.gameName === gameName);
  }

  function setGroup(newGroup) {
    let summaryRequest = new XMLHttpRequest();
    summaryRequest.onreadystatechange = function () {
      if (requestIsDone(summaryRequest)) {
        if (requestHasSucceeded(summaryRequest)) {
          let newSummaries = JSON.parse(summaryRequest.responseText);
          setData(newSummaries);
        } else {
          errorArea.textContent = summaryRequest.responseText;
          resultsArea.classList.add('hidden');
          errorArea.classList.remove('hidden');
        }
      }
    }

    group = newGroup;
    groups[newGroup.name] = newGroup;

    groupDescription.textContent = group.description;
    // if (group.description) {
    //   groupDescription.classList.remove('hidden');
    // } else {
    //   groupDescription.classList.add('hidden');
    // }

    let summaryRequestUrl = '/api/wordle/daily-result';

    const date = dateInput.value;
    if (date) {
      summaryRequestUrl += '/' + date;
    }

    // fetch results corresponding to the selected group
    summaryRequestUrl = addGroupParam(summaryRequestUrl);

    summaryRequest.open('GET', summaryRequestUrl, false);
    summaryRequest.send();
  }

  function refreshData() {
    errorArea.classList.add('hidden');

    if (!userInput.value || !groupInput.value) {
      noUserOrGroupArea.classList.remove('hidden');
      groupSelectionArea.classList.add('hidden');
      resultsArea.classList.add('hidden');
      return;
    }

    let title = 'Daily Games'
    if (groupInput.value.includes('family') && userInput.value === 'Trix') {
      title = 'Puzzeltjes';
    }

    titleSpan.textContent = title;
    document.title = title;

    if (groupInput.value.includes(',')) {
      groupSelectionArea.classList.remove('hidden');
    }

    const selectedGroup = getSelectedGroup();
    
    // Initialize settings summary
    updateSettingsSummary();

    if (groups[selectedGroup]) {
      setGroup(groups[selectedGroup]);
      return;
    }

    let groupRequest = new XMLHttpRequest();
    groupRequest.onreadystatechange = function () {
      if (!requestIsDone(groupRequest)) {
        return;
      }

      if (requestHasSucceeded(groupRequest)) {
        setGroup(JSON.parse(groupRequest.responseText))
      } else {
        resultsArea.classList.add('hidden');
        noUserOrGroupArea.classList.remove('hidden');
      }
    }

    let groupRequestUrl =  ['/api/wordle/group', selectedGroup].join('/');

    groupRequest.open('GET', groupRequestUrl, true);
    groupRequest.send();
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

  let lastDailyResults;
  function setData(dailyResults) {
    lastDailyResults = dailyResults;

    leaderboard = {};
    clearData(summaryArea);

    const selectedGroup = getSelectedGroup();
    const leaderboardSettings = getLeaderboardSettings(selectedGroup);
    const displayMode = getGamesDisplay();
    const sortMode = getGamesSort();

    // Filter games for leaderboard calculation
    const leaderboardGames = filterGamesForLeaderboard(games, leaderboardSettings);
    
    // Filter games for display
    let gamesToDisplay = filterGamesForDisplay(games, displayMode);

    // Sort the displayed games
    let sortedGames = sortMode === 'popularity'
      ? gamesToDisplay.toSorted((a, b) => {
          const popA = group.games && group.games[a.gameName] ? group.games[a.gameName].popularity : 0;
          const popB = group.games && group.games[b.gameName] ? group.games[b.gameName].popularity : 0;
          return popB - popA;
        })
      : sortMode === 'alphabetically'
      ? gamesToDisplay.toSorted((a, b) => b.gameName > a.gameName ? -1 : 1)
      : sortMode === 'personal'
      ? gamesToDisplay.toSorted((a, b) => b.myPopularity - a.myPopularity)
      : gamesToDisplay;

    sortedGames.forEach((game) => {
      let dailyResultsForGame = dailyResults
        .filter((dailyResult) => dailyResult.game == game.gameName);

      let allUsersForGame = dailyResultsForGame
        .map((dailyResult) => dailyResult.user);
      let users = allUsersForGame.filter((user, index) => allUsersForGame.indexOf(user) === index);

      let myDailyResult = dailyResultsForGame.find(dailyResult => dailyResult.user === userInput.value);

      let gameContainer = document.createElement('div');
      gameContainer.classList.add('game');
      
      const countsForLeaderboard = shouldCountForLeaderboard(game.gameName, leaderboardGames);
      
      // Only show border if leaderboard mode is not "all" (since all games would have it)
      if (countsForLeaderboard && leaderboardSettings.mode !== 'all') {
        gameContainer.classList.add('count-winner');

        if (allUsersForGame.length > 1) {
          gameContainer.classList.add('competitive');
        }
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
              let score = getScore(dailyResult, game.golfScoring);
              let isFailure = scoreIsFailure(score, game)
              let winner = !isFailure && scoreIsWinning(score, game, scores);
              let container = addResult(game, dailyResult, user, winner, scores.length);
              resultsList.appendChild(container);

              if (countsForLeaderboard && !isFailure && scores.length > 1) {
                logResult(user, winner);
              }
            });
        });

      summaryArea.appendChild(gameContainer);
    });

    noUserOrGroupArea.classList.add('hidden');
    resultsArea.classList.remove('hidden');

    // Show or hide leaderboard based on mode
    // Only update if settings are NOT open (to avoid jumping)
    if (!settingsAreOpen) {
      updateLeaderboardVisibility();
      
      if (leaderboardSettings.mode !== 'hidden') {
        displayLeaderboard();
      }
    }
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

  function addResult(game, dailyResult, label, winner, numResults) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('result-wrapper');

    if ((group.selectGames && group.games[game.gameName].countWinner || !group.selectGames) && numResults > 1 && winner) {
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

        if (!userInput.value || !groupInput.value) {
          const noUserOrGroupWarning = document.createElement('p');
          noUserOrGroupWarning.classList.add('help');
          noUserOrGroupWarning.textContent = noUserOrGroupArea.textContent;
          dialogBody.appendChild(noUserOrGroupWarning);
          return;
        }

        let labelContainer = document.createElement('div');
        let resultsLabel = document.createElement('label');
        resultsLabel.for = 'results';
        resultsLabel.textContent = 'Paste or enter your result here:';
        labelContainer.appendChild(resultsLabel);
        dialogBody.appendChild(labelContainer);

        let resultsInput = document.createElement('pre');
        resultsInput.contentEditable = true;
        resultsInput.id = 'results';
        resultsInput.enterKeyHint = 'done';

        const errorArea = document.createElement('div');
        errorArea.id = 'result-error-area'
        errorArea.classList.add('error');

        const handleSuccess = () => {
          dialogBody.parentElement.parentElement.remove();
        };

        const handleError = (errorText) => {
          errorArea.innerHTML = errorText;
        };

        let submit = () => submitResult(resultsInput.innerText, handleSuccess, handleError);

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

        dialogBody.appendChild(errorArea);

        // auto-paste isn't working, maybe try it again later.
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

          const handleSuccess = () => {
            dialogBody.parentElement.parentElement.remove();
          };

          const handleError = (errorText) => {
            let errorArea = dialogBody.querySelector('#result-error-area');
            errorArea.innerHTML = errorText;
          };

          submitResult(resultsInput.innerText, handleSuccess, handleError);
        });
        submitButton.textContent = 'Submit';

        if (!userInput.value || !groupInput.value) {
          submitButton.disabled = true;
        }

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

    groupArea.classList.remove('hidden');

    // first check the URL for a group
    const thisUrlParams = new URLSearchParams(location.search);
    let group = thisUrlParams.getAll('group').filter(Boolean);
    if (!group || !group.length) {
      // if the URL does not have a group specified, check local storage
      group = localStorage.getItem('group')?.split(',')?.filter(Boolean);
    }

    setGroups(group, false);

    refreshData();

    if (localStorage.getItem('today') !== dateInput.value) {
      localStorage.setItem('today', dateInput.value);
    }
  }

  (function initialize() {
    let gamesRequest = new XMLHttpRequest();
    gamesRequest.onreadystatechange = function () {
      if (requestHasSucceeded(gamesRequest)) {
        games = JSON.parse(gamesRequest.responseText);
        initializeStep2();
      }
    }

    let gamesParams = new URLSearchParams({ user: userInput.value || localStorage.getItem('user') });
    gamesRequest.open('GET', '/api/wordle/games?' + gamesParams.toString(), true);
    gamesRequest.send();

    let dailyWordRequest = new XMLHttpRequest();
    dailyWordRequest.onreadystatechange = function () {
      if (requestHasSucceeded(dailyWordRequest)) {
        let response = JSON.parse(dailyWordRequest.responseText);
        startingWord.innerText = response.word;
        startingWord.href = 'https://www.google.com/search?q=' + encodeURIComponent('define: ' + response.word);
        dateInput.value = response.date;
        if (advancedModeEnabled()) {
          todaySpan.innerText = 'Advanced Mode';
        } else {
          todaySpan.innerText = new Date(dateInput.value + ' 00:00:00').toLocaleDateString();
        }
        initializeStep2();
      }
    }

    dailyWordRequest.open('GET', '/api/wordle/daily-word', true);
    dailyWordRequest.send();
  })();

  function setUser(refresh = true) {
    localStorage.setItem('user', userInput.value);

    if (refresh) {
      refreshData();
    }
  }

  setUserButton.addEventListener('click', setUser);
  userInput.addEventListener('keyup', enterListener(setUser));

  function setGroups(groups = getGroupsFromInput(), refresh = true) {
    localStorage.setItem('group', groups?.toString());
    groupInput.value = groups?.toString();

    const thisUrlParams = new URLSearchParams(location.search);
    thisUrlParams.delete('group');
    groups?.forEach(group => thisUrlParams.append('group', group));
    const newUrl = location.origin + location.pathname + (groups?.length ? '?' : '') + thisUrlParams.toString();
    history.replaceState({path: newUrl}, '', newUrl);

    let selectedGroup = getSelectedGroup();
    if (!groups.includes(selectedGroup)) {
      selectedGroup = undefined;
    }

    groupSelectionArea.innerHTML = '';

    if (groups.length <= 1) {
      groupSelectionArea.classList.add('hidden');
    } else {
      groupSelectionArea.classList.remove('hidden')
    }

    if (groups && groups.length) {
      if (!selectedGroup) {
        selectedGroup = groups[0];
      }
  
      groups.forEach(group => {
        const groupButton = document.createElement('button');
        groupButton.id = `select-${group}-group`;
        groupButton.textContent = group;
        groupButton.dataset.group = group;
        if (group === selectedGroup) {
          groupButton.classList.add('selected');
        }
        groupButton.addEventListener('click', () => {
          if (!groupButton.classList.contains('selected')) {
            document.querySelectorAll('.group-tabs button.selected')
              .forEach(groupButton => groupButton.classList.remove('selected'));

            groupButton.classList.add('selected');
            updateSettingsSummary();
            closeSettingsCard();
            refreshData();
          }
        });
        groupSelectionArea.appendChild(groupButton);
      });
    }

    if (refresh) {
      refreshData();
    }
  }

  setGroupButton.addEventListener('click', () => setGroups());
  groupInput.addEventListener('keyup', enterListener(() => setGroups()));

  let submittingResult = false;

  function submitResult(resultText, handleSuccess, handleError) {
    if (submittingResult || !userInput.value || !resultText) {
      return;
    }

    submittingResult = true;

    let submitRequest = new XMLHttpRequest();
    submitRequest.onreadystatechange = function () {
      if (requestIsDone(submitRequest)) {
        submittingResult = false;
      }

      if (requestHasSucceeded(submitRequest)) {
        if (!advancedModeEnabled() && dateInput.value !== new Date(Date.now()).toISOString().substring(0, new Date(Date.now()).toISOString().indexOf('T'))) {
          location.reload();
          return;
        }

        refreshData();

        setTimeout(() => {
          handleSuccess();
          enableScroll();
        }, 250);
      } else {
        handleError(submitRequest.responseText);
      }
    }

    let url = '/api/wordle/daily-result/' + userInput.value;

    if (advancedModeEnabled() && dateInput.value) {
      url += '/' + dateInput.value;
    }

    submitRequest.open('PUT', addGroupParams(url), true);
    submitRequest.setRequestHeader('Content-Type', 'application/json');
    submitRequest.send(JSON.stringify(resultText));
  }

  toggleSettingsButton.addEventListener('click', toggleSettingsCard);
  closeSettingsButton.addEventListener('click', closeSettingsCard);

  // Leaderboard mode change
  document.querySelectorAll('input[name="leaderboard-mode"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
      const selectedGroup = getSelectedGroup();
      if (!selectedGroup) return;

      const settings = getLeaderboardSettings(selectedGroup);
      settings.mode = event.target.value;
      saveLeaderboardSettings(selectedGroup, settings);
      
      leaderboardCountInput.disabled = settings.mode !== 'top';
      updateSettingsSummary();
      
      // Update visibility - will hide but preserve space if settings are open and state changed
      updateLeaderboardVisibility();
      
      if (lastDailyResults) {
        setData(lastDailyResults);
      }
    });
  });

  // Leaderboard count change
  leaderboardCountInput.addEventListener('change', (event) => {
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup) return;

    const settings = getLeaderboardSettings(selectedGroup);
    settings.count = parseInt(event.target.value) || 6;
    saveLeaderboardSettings(selectedGroup, settings);
    
    updateSettingsSummary();
    
    if (lastDailyResults) {
      setData(lastDailyResults);
    }
  });

  // Games display change
  document.querySelectorAll('input[name="games-display"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
      saveGamesDisplay(event.target.value);
      updateSettingsSummary();
      
      if (lastDailyResults) {
        setData(lastDailyResults);
      }
    });
  });

  // Games sort change
  document.querySelectorAll('input[name="games-sort"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
      saveGamesSort(event.target.value);
      updateSettingsSummary();
      
      if (lastDailyResults) {
        setData(lastDailyResults);
      }
    });
  });

  function getSelectedGroup() {
    return document.querySelector('.group-tabs button.selected')
      ?.dataset
      ?.group;
  }

  function getGroupsFromInput() {
    return groupInput.value
      .split(',')
      .filter(Boolean)
      .map(group => group.trim());
  }

  function addGroupParams(url, newUrlParams = new URLSearchParams()) {
    const groups = getGroupsFromInput();
    if (!groups || !groups.length) {
      return url;
    }

    groups.forEach((group) => newUrlParams.append('group', group));

    return url + '?' + newUrlParams.toString();
  }

  function addGroupParam(url, newUrlParams = new URLSearchParams()) {
    const group = getSelectedGroup();
    if (!group) {
      return url;
    }

    newUrlParams.append('group', group);

    return url + '?' + newUrlParams.toString();
  }

  startSubmitButton.addEventListener('click', startSubmit);

  function setClipboard(dailyResult) {
    navigator.clipboard.writeText(dailyResult.result);
  }
})();
