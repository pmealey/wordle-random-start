let summaries = [];

function requestIsDone(request) {
  return request.readyState === XMLHttpRequest.DONE && request.status >= 200 && request.status < 300;
}

function getData(notify, date) {
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

      summaries = newSummaries;
      postMessage(newSummaries);
    }
  }

  let url = '/api/wordle/daily-result';

  if (date) {
    url += '/' + date;
  }

  summaryRequest.open('GET', url, false);
  summaryRequest.send();
}

const thirtySeconds = 30 * 1000; // 30 seconds
const fiveMinutes = 5 * 60 * 1000; // 5 minutes

function periodicallyRefreshData(date) {
  setTimeout(() => {
    getData(true, date);
  }, fiveMinutes);
}

onmessage = function(e) {
  if (e.data.type === 'refresh') {
    getData(false, e.data.date)
  } else if (e.data.type === 'notify') {
    periodicallyRefreshData(e.data.date);
  } else if (e.data.type === 'test-notification') {
    setTimeout(() => {
      new Notification('Test Notification 1', { body: 'Hi Patrick! Did you get this notification?',  })
    }, thirtySeconds);
    setTimeout(() => {
      new Notification('Test Notification 2', { body: 'Hi Patrick! Did you get this notification?',  })
    }, fiveMinutes);
  }
}
