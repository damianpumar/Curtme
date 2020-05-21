chrome.browserAction.onClicked.addListener(function(activeTab){
  	chrome.tabs.getSelected(null, function(tab) {
    	openCurtme(tab.url);
	});
});

function openCurtme(longURL) {
  const curtmeURL = `https://curtme.org?longURL=${longURL}`;
  chrome.tabs.create({ url: curtmeURL });
}