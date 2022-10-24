/***
 * dom elements
 ***/
const header = document.querySelector('header'),
hamburger = header.querySelector("details"),
mainContainer = document.querySelector('main'),
timeline = mainContainer.querySelector('#timeline'),
activities = mainContainer.querySelector('#activities');

/*** 
* cv html
***/
const startYear = 1998, numYears = 2024 - startYear,
years = Array.from(Array(numYears).keys()),
monthHeight = 100 / numYears / 12,
appendSpiral = function({el, count = 1}) {
	if (el == null) return;
	for (i = 0; i < count; i++) {
		const container = document.createElement("span");
		container.classList.add("spiral");
		container.innerHTML = `
			<svg viewBox="0 0 100 161.8">
				<path d="M0,0 c55.3,0,100,44.7,100,100c0,34.2-27.6,61.8-61.8,61.8C17.1,161.8,0,144.7,0,123.6c0-13,10.6-23.6,23.6-23.6c8.1,0,14.6,6.5,14.6,14.6c0,5-4,9-9,9c-3.1,0-5.6-2.5-5.6-5.6c0-1.9,1.5-3.4,3.4-3.4"></path>
				<line x1="0" x2="-161.8" y1="0" y2="0"></line>
			</svg>`;
		el.appendChild(container);
	}
},
calculateTop = function({month, year}) {
	return (12 * (2022 - parseInt(year))) + 13 - parseFloat(month);
},
calculateBottom = function({month, year}) {
	let bottom = 12 * (parseInt(year) - startYear + 1);
	return bottom + parseFloat(month) - 1;
};

async function setupHtml() {
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
		appendSpiral({el: act.querySelector("h4")});
		appendSpiral({el: act.querySelector("h5")});

		if (span > 3) {
			const foot = document.createElement("footer");
			foot.innerHTML = `<small>
				${act.getAttribute("data-start-year")}: 
				<strong>${act.querySelector("strong").innerHTML}</strong>
			</small>`;
			appendSpiral({el: foot, count: 2});
			act.appendChild(foot);

			act.querySelectorAll("li").forEach(function(eve) {
				const pos = calculateTop({month: eve.getAttribute("data-event-month"), year: eve.getAttribute("data-event-year")});
				eve.style.top = `${(pos - top) / span * 100}%`;
			});
		} // else it's a one-off project
	});
  	return;
};

/*** 
* lazyload cv
***/
async function initCV() {
	await setupHtml();

	const ioHeader = new IntersectionObserver(
		function(items) {
			items.forEach(function({target, isIntersecting}) {
				target.setAttribute("data-state", isIntersecting ? "in" : "out")
				target.nextElementSibling.setAttribute("data-header-state", isIntersecting ? "in" : "out");
				if (isIntersecting) target.nextElementSibling.setAttribute("data-scroll-direction", "down");
			});
		}, 
		{
			root: mainContainer,
	  		threshold: [0.9]
		}
	);

	activities.querySelectorAll('h4').forEach((el) => ioHeader.observe(el));

	const ioFooter = new IntersectionObserver(
		function(items) {
			items.forEach(function({target, isIntersecting}) {
				target.setAttribute("data-state", isIntersecting ? "in" : "out")
				target.previousElementSibling.setAttribute("data-footer-state", isIntersecting ? "in" : "out");	
				if (isIntersecting) target.previousElementSibling.setAttribute("data-scroll-direction", "up");
			});
		}, 
		{
			root: mainContainer,
	  		threshold: [0.9]
		}
	);

	activities.querySelectorAll('footer').forEach((el) => ioFooter.observe(el));
}

initCV();

/*** 
* toggle splash/scroll
***/
const setSplash = (isSplash) => document.body.setAttribute("data-state", isSplash ? "splash" : "scroll"),
scrollMain = ([top, left]) => mainContainer.scrollTo({top: top, left: left, /*behavior: 'smooth'*/});

header.querySelector("[data-action=scroll]").addEventListener("click", () => setSplash(false));
header.querySelector("[data-action=splash]").addEventListener("click", () => scrollMain([0,0]));

hamburger.addEventListener("toggle", function(event) {
	const showContent = (document.body.getAttribute("data-state") === "splash");
	if (hamburger.getAttribute("open") == null) {
		console.log("hamburger toggle closed")
		if (showContent) hamburger.setAttribute("open", ""); // force it to open
		else hamburger.querySelector("summary").blur(); // remove the focus
	}
	else console.log("hamburger toggle opened")

	if (showContent) {
		console.log("force skills open and scroll")
		hamburger.querySelector("details").setAttribute("open", ""); // ensure the first child is open
		setSplash(false); // do this last
	}
});
new IntersectionObserver(
	(items) => setSplash(items[0].isIntersecting), 
	{ root: mainContainer, threshold: [0] }
).observe(mainContainer.querySelector("#top"));
