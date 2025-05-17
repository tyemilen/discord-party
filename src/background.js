const CONSTANTS = {
	SPOTIFY_URL: 'https://open.spotify.com'
};

const state = {
	spotifyTabId: null,
	track: {},
	user: null,
	playing: false
};

const sendDataToSpotify = () => {
	chrome.tabs.sendMessage(state.spotifyTabId, {
		type: 'SPOTIFY_DATA',
		data: JSON.stringify(state.track)
	});
};

const spotify = () => {
	if (!state.spotifyTabId) {
		chrome.tabs.create({ url: CONSTANTS.SPOTIFY_URL }, (tab) => {
			state.spotifyTabId = tab.id;

			const handleTabReady = (tabId, changeInfo) => {
				if (tabId === state.spotifyTabId && changeInfo.status === 'complete') {
					chrome.tabs.onUpdated.removeListener(handleTabReady);

					chrome.scripting.executeScript({
						target: { tabId: tab.id },
						files: ['spotify.js'],
						world: 'MAIN'
					}, () => {
						if (chrome.runtime.lastError) return;
						sendDataToSpotify();
					});
				}
			};

			chrome.tabs.onUpdated.addListener(handleTabReady);
		});
	} else {
		sendDataToSpotify();
	}
};

const actions = {
	DISCORD_INJECT: (request, sender, sendResponse) => {
		chrome.scripting.executeScript({
			target: { tabId: sender.tab.id },
			files: ['discord.js'],
			world: 'MAIN'
		});

		return sendResponse();
	},
	DISCORD_DATA: (request, sender, sendResponse) => {
		if (!request.payload.state) return;

		const payload = JSON.parse(request.payload.state);
		const { state: trackArtist, details: trackName } = payload.track;

		if (state.track.artist === trackArtist && state.track.name === trackName) return;

		state.track = {
			artist: trackArtist,
			name: trackName
		};
		state.user = payload.track;

		console.log('Updated state:', state);
		spotify();
		return sendResponse();
	}
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const action = actions[request.action];
	if (!action) return;

	return action(request, sender, sendResponse);
});

chrome.tabs.onRemoved.addListener((closedTabId) => {
	if (closedTabId === state.spotifyTabId) {
		state.spotifyTabId = null;
	}
});