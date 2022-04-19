(function refreshData() {
  setTimeout(() => {
    postMessage('refresh');
    refreshData();
  }, 5 * 60 * 1000) // 5 minutes
})();
