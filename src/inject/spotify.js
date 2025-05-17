const state = {
	track: {}
}
const sleep = (time) => new Promise(resolve => setTimeout(resolve, time));

const queries = {
	search: '[aria-label="What do you want to play?"]',
	play: '[aria-rowindex="1"] > [data-testid="tracklist-row"]'
};

const play = () => {
	document.querySelector(queries.play).querySelector('button').click();
}

const searchAndPlay = async () => {
	const enterEvent = new KeyboardEvent('keydown', {
		key: 'Enter',
		code: 'Enter',
		keyCode: 13,
		which: 13,
		bubbles: true,
		cancelable: true
	});

	const search = document.querySelector(queries.search);
	search.focus()
	search.value = `${state.track.artist} - ${state.track.name}`;
	search.dispatchEvent(enterEvent);

	await sleep(1500);

	const observer = new MutationObserver((mutationList, obs) => {
		for (const _ of mutationList) {
			const searchDone = document.querySelector('[aria-rowindex="1"] > [data-testid="tracklist-row"]');

			if (!searchDone) continue;
			searchDone.focus();
			break;
		}
		play();
		document.body.focus();

		obs.disconnect();
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true
	});
}

const waitUntilSearch = async () => {
	const searchLoaded = document.querySelector('[aria-label="What do you want to play?"]');

	if (!searchLoaded) {
		await sleep(1000);
		return waitUntilSearch();
	}

	return true;
}

window.addEventListener('message', async (event) => {
	if (event.data.type !== 'SPOTIFY_DATA') return;

	const data = JSON.parse(event.data.data);

	if (state.track.artist == data.artist && state.track.name == data.name) return;

	state.track = data;

	console.log("%c[discord-party] %cPlaying a new track", "color: #bada55", "");

	const searchLoaded = await waitUntilSearch();

	if (searchLoaded) searchAndPlay();
});

document.addEventListener('DOMContentLoaded', () => {
	const originalTitle = document.title;

	const padding = ' '.repeat(originalTitle.length);
	const scrollingText = padding + originalTitle + padding;

	let position = scrollingText.length - originalTitle.length;

	function animateTitle() {
		document.title = scrollingText.substring(position, originalTitle.length);

		position = (position - 1 + scrollingText.length) % scrollingText.length;
	}

	setInterval(animateTitle, 150);
});