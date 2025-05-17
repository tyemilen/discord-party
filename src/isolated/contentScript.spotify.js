chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'SPOTIFY_DATA') {
		window.postMessage({
			type: 'SPOTIFY_DATA',
			data: request.data
		});
	}
});