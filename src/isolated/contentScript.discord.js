chrome.runtime.sendMessage({
	action: 'DISCORD_INJECT'
});

window.addEventListener('message', (event) => {
	if (event.data.source == 'DISCORD_PARTY') {
		chrome.runtime.sendMessage({
			action: 'DISCORD_DATA',
			payload: event.data.payload
		});
	}
});