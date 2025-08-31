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

    const svg = d3.select("svg"),
          margin = {top: 20, right: 30, bottom: 40, left: 50},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Chart title
    svg.append("text")
      .attr("x", (width + 50) / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Company Stock Performance with Article Dates");

    // X-axis label
    svg.append("text")
      .attr("x", (width+50) / 2)
      .attr("y", height + 60)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Date");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Stock Price (USD)");

    // Sample data
    const stockData = [
      {date: "2024-04-01", price: 150},
      {date: "2024-05-01", price: 130},
      {date: "2025-01-01", price: 100},
      {date: "2025-01-01", price: 100},
      {date: "2025-02-01", price: 120},
      {date: "2025-03-01", price: 90},
      {date: "2025-05-01", price: 100},
    ];

    const articleData = [
      {date: "2024-05-20", title: "Article 1"},
      {date: "2025-01-15", title: "Article A"},
      {date: "2025-03-10", title: "Article B"},
      {date: "2025-04-20", title: "Article C"}
    ];

    const parseDate = d3.timeParse("%Y-%m-%d");
    stockData.forEach(d => d.date = parseDate(d.date));
    articleData.forEach(d => d.date = parseDate(d.date));

    let x = d3.scaleTime()
      .domain(d3.extent(stockData, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stockData, d => d.price)])
      .nice()
      .range([height, 0]);

    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    const yAxis = g.append("g")
      .call(d3.axisLeft(y));

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.price));

    const tooltip = d3.select(".tooltip");

    const stockLine = g.append("path")
      .datum(stockData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    let adjustment = 50;
    let adj = adjustment;

    const articleDots = g.selectAll(".dot")
      .data(articleData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(getPriceAtDate(stockData, d.date))) // align around mean
      .attr("r", 5)
      .attr("fill", "orange")
      .on("mouseover", (event, d, idx) => {
        console.log()
        tooltip.transition().style("opacity", 1);
        tooltip.html(d.title + "<br>" + d.date.toDateString())
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");

        event.target.style.cursor = 'pointer';
      })
      .on("mouseout", () => {
        tooltip.transition().style("opacity", 0);

        svg.selectAll(".hover-bar").remove();
      })

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
      const newX = event.transform.rescaleX(x);

      xAxis.call(d3.axisBottom(newX));

      stockLine.attr("d", d3.line()
        .x(d => newX(d.date))
        .y(d => y(d.price))(stockData));

      articleDots.attr("cx", d => newX(d.date));
    }