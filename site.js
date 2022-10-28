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
const startYear = 1997, endYear = 2023, numYears = endYear - startYear,
years = Array.from(Array(numYears).keys()), 
monthPercentage = 100 / numYears / 12,
appendSpiral = function({el, count = 1}) {
	if (el == null) return;
	for (i = 0; i < count; i++) {
		const container = document.createElement("span");
		container.classList.add("spiral");
		container.innerHTML = `
			<svg viewBox="0 0 100 161.8">
				<path d="M0,0 c55.3,0,100,44.7,100,100c0,34.2-27.6,61.8-61.8,61.8C17.1,161.8,0,144.7,0,123.6c0-13,10.6-23.6,23.6-23.6c8.1,0,14.6,6.5,14.6,14.6c0,5-4,9-9,9c-3.1,0-5.6-2.5-5.6-5.6c0-1.9,1.5-3.4,3.4-3.4"></path>
				<line x1="-161.8" x2="0" y1="0" y2="0"></line>
			</svg>`;
		el.appendChild(container);
	}
},
calculatePosition = function({toYear, toMonth, fromYear = null, fromMonth = 1}) {
	const calculateMonth = (y, m) => (12 * (endYear - 1 - parseInt(y))) + 13 - parseFloat(m),
	startMonth = calculateMonth(toYear, toMonth),
	endMonth = fromYear == null ? startMonth : calculateMonth(fromYear, fromMonth)
	return [startMonth, endMonth - startMonth];
};

async function setupHtml() {
	timeline.innerHTML = years.reverse().reduce(function(str, year) {
		return str + `<li data-year="${startYear + year + 1}"></li>`;
	}, "");

	activities.querySelectorAll("article").forEach(function(act) {
		const [activityTop, activityLength] = calculatePosition({
			toYear: act.getAttribute("data-end-year"), 
			toMonth: act.getAttribute("data-end-month"),
			fromYear: act.getAttribute("data-start-year"),
			fromMonth: act.getAttribute("data-start-month"),
		});
		act.style.top = `${activityTop * monthPercentage}%`;
		act.style.minHeight = `${activityLength * monthPercentage}%`;
		const foot = document.createElement("footer");
		foot.innerHTML = `<small>${act.querySelector("h5").innerHTML}</small>`;
		act.appendChild(foot);
		appendSpiral({el: foot, count: 2});
		appendSpiral({el: act.querySelector("h4")});
		appendSpiral({el: act.querySelector("h5")});
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
			});
		}, 
		{
			root: mainContainer,
	  		threshold: [0]
		}
	);

	activities.querySelectorAll('h4').forEach((el) => ioHeader.observe(el));

	const ioFooter = new IntersectionObserver(
		function(items) {
			items.forEach(function({target, isIntersecting}) {
				target.setAttribute("data-state", isIntersecting ? "in" : "out")
				target.previousElementSibling.setAttribute("data-footer-state", isIntersecting ? "in" : "out");	
			});
		}, 
		{
			root: mainContainer,
	  		threshold: [0]
		}
	);

	activities.querySelectorAll('footer').forEach((el) => ioFooter.observe(el));

	const ioContent = new IntersectionObserver(
		function(items) {
			items.forEach(function({target, isIntersecting}) {
				target.setAttribute("data-state", isIntersecting ? "in" : "out")
			});
		}, 
		{
			root: mainContainer,
	  		threshold: [0]
		}
	);

	activities.querySelectorAll('figure').forEach((el) => ioContent.observe(el));
}

initCV();

/*** 
* toggle splash/scroll
***/
const setSplash = (isSplash) => document.body.setAttribute("data-state", isSplash ? "splash" : "scroll"),
scrollMain = ([top, left]) => mainContainer.scrollTo({top: top, left: left, /*behavior: 'smooth'*/});

header.querySelector("[data-action=scroll]").addEventListener("click", () => setSplash(false));
header.querySelector("[data-action=splash]").addEventListener("click", function() {
	setSplash(true);
	scrollMain([0,0]);
});

hamburger.addEventListener("toggle", function(event) {
	const showContent = (document.body.getAttribute("data-state") === "splash");
	if (hamburger.getAttribute("open") == null) {
		if (showContent) hamburger.setAttribute("open", ""); // force it to open
		else hamburger.querySelector("summary").blur(); // remove the focus
	}

	if (showContent) {
		hamburger.querySelector("details").setAttribute("open", ""); // ensure the first child is open
		setSplash(false); // do this last
	}
});
new IntersectionObserver(
	(items) => setSplash(items[0].isIntersecting), 
	{ root: mainContainer, threshold: [0] }
).observe(mainContainer.querySelector("#top"));
