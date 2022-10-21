/***
 * dom elements
 ***/
const header = document.querySelector('header'),
hamburger = header.querySelector(".details"),
mainContainer = document.querySelector('main'),
timeline = mainContainer.querySelector('#timeline'),
activities = mainContainer.querySelector('#activities');


/*** 
* cv html
***/
const startYear = 1998, numYears = 2024 - startYear,
years = Array.from(Array(numYears).keys()),
monthHeight = 100 / numYears / 12,
appendSpiral = function(el) {
	const container = document.createElement("span");
	container.innerHTML = `
		<svg viewBox="0 0 100 161.8">
			<path d="M0,0 c55.3,0,100,44.7,100,100c0,34.2-27.6,61.8-61.8,61.8C17.1,161.8,0,144.7,0,123.6c0-13,10.6-23.6,23.6-23.6c8.1,0,14.6,6.5,14.6,14.6c0,5-4,9-9,9c-3.1,0-5.6-2.5-5.6-5.6c0-1.9,1.5-3.4,3.4-3.4"></path>
			<line x1="0" x2="-161.8" y1="0" y2="0"></line>
		</svg>`;
	el.appendChild(container);
},
calculateTop = function({month, year}) {
	return (12 * (2022 - parseInt(year))) + 13 - parseFloat(month);
},
calculateBottom = function({month, year}) {
	let bottom = 12 * (parseInt(year) - startYear + 1);
	return bottom + parseFloat(month) - 1;
};

timeline.setAttribute("data-years", numYears);
timeline.innerHTML = years.reverse().reduce(function(str, year) {
	return str + `<li data-year="${startYear + year}"></li>`;
}, "");

activities.querySelectorAll("article").forEach(function(act) {
	const top = calculateTop({year: act.getAttribute("data-end-year"), month: act.getAttribute("data-end-month")}),
	bottom = calculateBottom({year: act.getAttribute("data-start-year"), month: act.getAttribute("data-start-month")}),
	span = (numYears * 12) - bottom - top;
	act.style.top = `${top * monthHeight}%`;
	act.style.bottom = `${bottom * monthHeight}%`;
	appendSpiral(act.querySelector("h4"));
	appendSpiral(act.querySelector("h5"));
	if (span > 3) {
		const foot = document.createElement("footer");
		foot.innerHTML = `
			<small>
				${act.getAttribute("data-start-year")}: 
				<strong>${act.querySelector("strong").innerHTML}</strong>
			</small>`;
		appendSpiral(foot);
		appendSpiral(foot);
		act.appendChild(foot);

		act.querySelectorAll("li").forEach(function(eve) {
			const pos = calculateTop({month: eve.getAttribute("data-event-month"), year: eve.getAttribute("data-event-year")});
			eve.style.top = `${(pos - top) / span * 100}%`;
		});
	} // else it's a one-off project
});

/*** 
* lazyload cv
***/
const io = new IntersectionObserver(
	function(items) {
		items.forEach(function({target, isIntersecting}) {
			//console.log(target.dataset.year, isIntersecting)
		});
	}, 
	{
		root: mainContainer,
		rootMargin: '0px',
  		threshold: [0.2, 0.8]
	}
);

timeline.querySelectorAll('li').forEach(function(el) {
	io.observe(el)
});


/*** 
* toggle splash/scroll
***/
let open = false;
const setSplash = function(isSplash) {
	document.body.setAttribute("data-state", isSplash ? "splash" : "scroll");
}

header.querySelector("[data-action=scroll]").addEventListener("click", () => setSplash(false));
header.querySelector("[data-action=splash]").addEventListener("click", () => setSplash(true));

header.querySelectorAll("details").forEach(function(el) {
	el.addEventListener("toggle", function(event) {
		if (el.getAttribute("open") == null) {
			if (document.body.getAttribute("data-state") === "splash") {
				el.setAttribute("open", "");
				setSplash(false);
				el.querySelector("details").setAttribute("open", "");
			}
			el.querySelector("summary").blur();
		}
	});
});
new IntersectionObserver(
	(items) => setSplash(items[0].isIntersecting), 
	{ root: mainContainer, threshold: [0] }
).observe(mainContainer.querySelector("#top"));