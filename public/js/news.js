// const tags = ['Fin', 'Info', 'Conf', 'Sales', 'Met', 'MA', 'Org'];
let articleData = [];

let yearFilter = document.getElementById('filter-year')

function renderResults(data) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  data.forEach((item, idx) => {
    const { company, title, link, date, type } = item;
    const row = document.createElement('div');
    row.className = 'row';

    if (idx % 2 == 0) {
      row.classList.add('row-blue');
    }

    const subject = document.createElement('p');
    subject.textContent = company;
    subject.className = 'archive-title';

    const info = document.createElement('div');
    info.className = 'archive-info';

    const typeSpan = document.createElement('p');
    typeSpan.textContent = type;
    typeSpan.className = 'archive-type';

    const dateSpan = document.createElement('p');
    dateSpan.textContent = item.date;
    dateSpan.className = 'archive-date'

    const a = document.createElement('a');
    a.href = item.link;
    a.textContent = item.title;
    a.target = '_blank';
    a.className = 'archive-link';

    info.append(subject, typeSpan, dateSpan, a)
    row.append(info)
    container.appendChild(row);
  })
}

async function fetchByYear(event) {
  let year = event.target.value;

  if (year == 'All') {
    return;
  }

  let theBody = {
    year: year
  }

  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(theBody)
  }

  await fetch('/year', options)
    .then(res => res.json())
    .then(data => { 
      console.log(data) 
      renderResults(data) 
    })
    .catch(err => { console.log(err) })
}

yearFilter.addEventListener('change', fetchByYear)


// old
async function fetchArticles() {
  const res = await fetch('/viewer');
  articleData = await res.json();
  console.log(articleData)
  renderArticles();
}

function renderArticles(data = articleData) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  console.log(data);

  data.forEach(group => {
    const { company, source, articles } = group;

    // const groupDiv = document.createElement('div');
    // groupDiv.className = 'company-group';

    // const title = document.createElement('div');
    // title.className = 'company-title';
    // title.textContent = company;
    // groupDiv.appendChild(title);

    articles.forEach((article, i) => {
      const row = document.createElement('div');
      row.className = 'row';

      if (i % 2 == 0) {
        row.classList.add('row-blue');
      }

      const title = document.createElement('p');
      title.textContent = company;
      title.className = 'title';

      const info = document.createElement('div');
      info.className = 'info';

      const date = document.createElement('span');
      date.textContent = new Date(article.date).toLocaleDateString();
      date.className = 'date'

      const link = document.createElement('a');
      link.href = article.url.startsWith("http") ? article.url : source + article.url;
      link.textContent = article.title;
      link.target = '_blank';
      link.className = 'article'

      const category = document.createElement('p');
      category.textContent = article.tag;

      info.append(date, category, link);

      // const actions = document.createElement('div');
      // actions.className = 'actions';

      // const select = document.createElement('select');
      // tags.forEach(tag => {
      //   const opt = document.createElement('option');
      //   opt.value = tag;
      //   opt.textContent = tag;
      //   select.appendChild(opt);
      // });

      // const del = document.createElement('button');
      // del.textContent = 'x';
      // del.onclick = () => row.remove();

      // actions.append(select);
      row.append(title, info);

      // Attach metadata to the row
      // row.dataset.company = company;
      // row.dataset.source = source;
      // row.dataset.title = article.title;
      // row.dataset.link = link.href;
      // row.dataset.date = article.date;

      container.appendChild(row);
    });
  });
}

// const companyFilter = document.getElementById('filter-company');

// companyFilter.addEventListener('change', (event) => {
//   console.log(event.target.value)
// })

function applyFilters() {
  const company = document.getElementById('filter-company').value;
  const tag = document.getElementById('filter-tag').value;
  const date = document.getElementById('filter-date').value;
  const year = document.getElementById('filter-year').value;

  const filtered = articleData
    .map(group => {
      const filteredArticles = group.articles.filter(article => {
        const articleDate = new Date(article.date);

        return (
          (!company || group.company === company) &&
          (!tag || article.selectedTag === tag) &&
          (!date || articleDate >= new Date(date)) &&
          (!year || articleDate.getFullYear().toString() === year)
        );
      });

      return filteredArticles.length > 0
        ? { company: group.company, source: group.source, articles: filteredArticles }
        : null;
    })
    .filter(Boolean); // remove nulls

  renderArticles(filtered);
}

// fetchArticles();