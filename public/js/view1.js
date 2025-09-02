function getPriceAtDate(data, date) {
  // assume data is sorted by date
  const i = d3.bisector(d => d.date).left(data, date);
  if (i === 0) return data[0].price;
  if (i >= data.length) return data[data.length - 1].price;

  const d0 = data[i - 1];
  const d1 = data[i];

  // linear interpolation
  const t = (date - d0.date) / (d1.date - d0.date);
  return d0.price + t * (d1.price - d0.price);
}

function appendLine(data) {
  const offsetDate = x.invert(x(d.date) + 50);

  svg.append("line")
    .datum(data)
    .attr("class", "hover-bar")
    .attr("x1", x(offsetDate))
    .attr("x2", x(offsetDate))
    // .attr("y1", d => y(d3.mean(stockData, d => d.price)) + 23)
    .attr("y1", d => y(getPriceAtDate(stockData, d => d.date)))
    .attr("y2", y.range()[0] + 20)
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
}

let prices = []
let articles = []

const svg = d3.select("svg");
const margin = {
  top: 50, 
  right: 50, 
  bottom: 50, 
  left: 50
}
const width = svg.attr("width");
const height = svg.attr("height") - margin.top - margin.bottom;
const tooltip = d3.select(".tooltip");

svg.append("defs")
  .append("clipPath")
  .attr("id", "cp1")
  .append("rect")
  .attr("width", 750)
  .attr("height", 450)
  .attr("x", 0)
  .attr("y", 0)

const g = svg.append("g")
  .attr("transform", `scale(1) translate(60,60)`)
  .attr("clip-path", "url(#cp1)");

// X-axis label
svg.append("text")
  .attr("x", (width / 2) + 40)
  .attr("y", height + 120)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Date");

// Y-axis label
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 12)
  .attr("x", -220)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Stainless Steel (PPI)");

function renderData(priceData, articleData) {
  const parseDate = d3.timeParse("%Y-%m-%d");

  priceData.forEach(d => {
    d.date = parseDate(d.date)
    d.price = parseInt(d.price)
  });
  articleData.forEach(d => d.date = parseDate(d.date));

  let x = d3.scaleTime()
    .domain(d3.extent(priceData, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(priceData, d => d.price)])
    .nice()
    .range([height, 0]);

  const xAxis = svg.append("g")
    .attr("transform", `translate(60,${height + 60})`)
    .call(d3.axisBottom(x));

  const yAxis = svg.append("g")
    .attr("transform", `translate(60,60)`)
    .call(d3.axisLeft(y));

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.price));

  const stockLine = g.append("path")
    .datum(priceData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  const articleDots = g.selectAll(".dot")
    .data(articleData)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(getPriceAtDate(priceData, d.date))) // align around mean
    // .attr("cy", d => y(50))
    .attr("r", 3)
    .attr("fill", "steelblue")

    .on("mouseover", (event, d, idx) => {
      tooltip.transition().style("opacity", 1);
      tooltip.html(d.title + "<br>" + d.date.toDateString())
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");

      event.target.setAttribute("r", 6);
      event.target.setAttribute("fill", "blue");
      event.target.style.cursor = 'pointer';
    })

    .on("mouseout", () => {
      tooltip.transition().style("opacity", 0);
      event.target.setAttribute("r", 3)
      event.target.setAttribute("fill","steelblue")
    })

    .on("click", (event, d) => {
      window.open(d.link, '_blank').focus()
      // console.log(d)
    })

  // Zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1, 1000])
    .translateExtent([[10, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed(event) {
    const newX = event.transform.rescaleX(x);

    xAxis.call(d3.axisBottom(newX));

    stockLine.attr("d", d3.line()
      .x(d => newX(d.date))
      .y(d => y(d.price))(priceData));

    articleDots.attr("cx", d => newX(d.date));
  }
}

async function fetchBoeing() {
  await fetch('/boeing')
    .then(res => res.json())
    .then(data => { 
      priceData = data
      console.log(priceData) 
    })
    .catch(err => { console.log(err) })
}

async function fetchLockheed() {
  await fetch('/lockheed')
    .then(res => res.json())
    .then(data => { 
      articles = data;
      console.log(articles[0])
    })
    .catch(err => { console.log(err) })
}

async function fetchSteel() {
  await fetch('/steel')
    .then(res => res.json())
    .then(data => { 
      prices = data.prices
    })
    .catch(err => { console.log(err) })
}

async function fetchParallel() {
  const [res1, res2] = await Promise.all([
    fetch('/lockheed'),
    fetch('/steel')
  ]);

  articles = await res1.json()
  const data = await res2.json()

  prices = data.prices;

  articles = articles.map(article => {
    let mdy = article.date.split('.')
    let dateString = mdy[2].replace(' ', '') + '-' + mdy[0] + '-' + mdy[1];
    article.date = dateString
    return article
  });

  console.log(articles)
  console.log(prices)

  await renderData(prices, articles)
}

window.addEventListener('load', fetchParallel);