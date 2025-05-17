function getWebpackChunk() {
	let e = window.webpackChunkdiscord_app.push([[Symbol()],{},e=>e]);
	window.webpackChunkdiscord_app.pop();
	
	return e;
}

function collectModules() {
	const modules = [];
	const chunk = getWebpackChunk();
	for (const module of Object.values(chunk.c)) {
		if (module.exports && module.exports !== window) {
			modules.push(module.exports);
		}
	}
	return modules;
}

function findModule(filter) {
	return collectModules().find(filter);
}

function filterModules(filter) {
	return collectModules().filter(filter);
}

function searchModules(validator, findAll = false) {
	let results = findAll ? [] : null;
	const processor = findAll ? filterModules : findModule;

	const found = processor((module) => {
		const result = validator(module);
		if (result) {
			findAll ? results.push(result) : results = result;
		}
		return result;
	});

	if (!findAll) return typeof results === "string" ? found[results] : results;

	return results.map((result, index) =>
		typeof result === "string" ? found[index][result] : found[index]
	);
}

function hasModuleProperties(module, props) {
	let subModulePath = null;
	for (const prop of props) {
		if (module && typeof module === "object" && prop in module) continue;

		let shortProp = null;
		for (const key of Object.getOwnPropertyNames(module)) {
			if (key !== "default" && key.length > 3) continue;

			const value = module[key];
			if (value && typeof value === "object" && prop in value) {
				shortProp = key;
				break;
			}
		}

		if (!shortProp) return false;
		subModulePath = shortProp;
	}
	return subModulePath || true;
}

const find = (...props) => searchModules(m => hasModuleProperties(m, props));
const state = {
	user: null,
	track: null
};

const activityHandler = () => {
	if (!state.user) return;
	const activity = find('getActivities').getActivities(state.user.id).find(x => x.name == 'Spotify');
	
	if (!state || !activity) return;

	state.track = activity;

	const header = document.querySelectorAll('.leading_c38106')[0];
	header.innerHTML = `Listening to music with ${state.user.username}; ${activity.state} - ${activity.details}`

	header.style.color = 'white';
	header.style.fontStyle = 'italic';

	window.postMessage({
		source: 'DISCORD_PARTY',
		payload: {
			state: JSON.stringify(state)
		}
	});
}

const createButton = (username) => {
	const button = document.createElement('button');
	button.style.backgroundColor = 'green';
	button.style.padding = '1em';
	button.style.borderRadius = '4px';
	button.style.color = 'white';
	button.style.fontSize = 'bold';

	button.innerHTML = 'LISTEN TOGETHER BESPLATNO';

	button.addEventListener('click', (event) => {
		event.preventDefault();

		const user = Object.values(find('getUsers').getUsers()).find(x => x.username == username);

		state.user = user;
		activityHandler();
	});

	return button;
};

let mounted = false;
const mount = () => {
	if (mounted) return;
	console.log("%c[discord-party] %cInjected", "color: #bada55", "");

	find('getActivities').addChangeListener(() => activityHandler());

	mounted = true;
};

const observer = new MutationObserver((mutationList) => {
	for (const mutation of mutationList) {
		if (!mutation.addedNodes.length) continue;

		const rawClassList = mutation.addedNodes[0].classList?.value;

		if (!rawClassList && !rawClassList?.includes('clickTapContainer')) continue;

		const clickContainer = mutation.addedNodes[0];
		const activityContainer = clickContainer.querySelector('[class^="clickableContainer__"], [class*=" clickableContainer__"]');

		if (!activityContainer) continue;

		const username = clickContainer.querySelector("[aria-label]")?.ariaLabel;

		if (!username) continue;

		const footerContainer = clickContainer.querySelector('[class^="footer__"], [class*=" footer__"]');

		mount();

		footerContainer.style.display = 'flex';
		footerContainer.style.flexDirection = 'column';
		footerContainer.style.gap = '0.5em';

		footerContainer.prepend(createButton(username));
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});