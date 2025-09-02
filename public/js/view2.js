let stocks = []
let articles2 = []

function renderView2(priceData, articleData) {
  const svg = d3.select(".plot-2");
  const width = svg.attr("width");
  const height = svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g")
    .attr("transform", `scale(1) translate(60,60)`)
    .attr("clip-path", "url(#cp1)");

  svg.append("defs")
    .append("clipPath")
    .attr("id", "cp1")
    .append("rect")
    .attr("width", 750)
    .attr("height", 450)
    .attr("x", 0)
    .attr("y", 0)

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

async function fetchSteel() {
  await fetch('/steel')
    .then(res => res.json())
    .then(data => { 
      prices = data.prices
    })
    .catch(err => { console.log(err) })
}

async function fetchParallel2() {
  let obj = {
    company: 'Boeing'
  }

  let options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(obj)
  }

  const [res1, res2] = await Promise.all([
    fetch('/articles', options),
    fetch('/stocks')
  ]);

  articles2 = await res1.json()
  const data = await res2.json()

  stocks = data.prices;

  articles2 = articles2.map(article => {
    let mdy = article.date.split('.')
    let dateString = mdy[2].replace(' ', '') + '-' + mdy[0] + '-' + mdy[1];
    article.date = dateString
    return article
  });

  await renderView2(stocks, articles2)
}

// fetchParallel2()
window.addEventListener('load', fetchParallel2);