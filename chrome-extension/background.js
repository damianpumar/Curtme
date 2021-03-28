chrome.browserAction.onClicked.addListener(function (activeTab) {
  chrome.tabs.getSelected(null, function (tab) {
    openCurtme(tab.url);
  });
});

function openCurtme(sourceURL) {
  const curtmeURL = `https://curtme.org?sourceURL=${sourceURL}`;
  chrome.tabs.create({ url: curtmeURL });
}
