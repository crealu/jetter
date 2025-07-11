const tags = ['Fin', 'Info', 'Conf', 'Sales', 'Met', 'MA', 'Org'];
let articleData = [];
let companies = [];

let one = 'https://jetscan-fcaf0aedc4e1.herokuapp.com/scan-one';
let local = 'http://localhost:8000/scan-one';
let url = 'https://jetscan-fcaf0aedc4e1.herokuapp.com/scan';

async function getScan() {
  await fetch(url)
    .then(res => res.json())
    .then(data => { console.log(data) })
    .catch(err => { console.log(err) })
}

async function scan(i) {
  console.log('Scanning ' + companies[i].company);
  const { website } = companies[i];

  const theBody = { 
    companyIndex: i,
    website: website
  };

  console.log(theBody);

  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(theBody)
  }

  await fetch(one, options)
    .then(res => res.json())
    .then(data => { renderArticles(i, data.articles) })
    .catch(err => { console.log(err) })
}

async function fetchCompanies() {
  const res = await fetch('/companies');
  companies = await res.json();
  console.log(companies)
  renderCompanies();
}

function renderArticleRow(companyName, article) {
  const row = document.createElement('div');
  row.className = 'row';

  const company = document.createElement('div');
  company.textContent = companyName;
  company.className = 'company-name';

  const info = document.createElement('div');
  info.className = 'info';

  const date = document.createElement('span');
  date.textContent = new Date(article.date).toLocaleDateString();
  date.className = 'date'

  const titleGroup = document.createElement('div');
  titleGroup.className = 'title-group';

  const copyTitleBtn = document.createElement('button');
  copyTitleBtn.innerHTML = '<img class="copy-btn" src="img/copy-icon.png"/>'
  copyTitleBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(article.title);
  })

  const title = document.createElement('p');
  title.textContent = article.title;

  const copyLinkBtn = document.createElement('button');
  copyLinkBtn.innerHTML = '<img class="copy-btn" src="img/copy-icon.png"/>'
  copyLinkBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(article.link);
  });

  const link = document.createElement('a');
  link.href = article.link;
  link.textContent = article.link;
  link.target = '_blank';

  const select = document.createElement('select');
  select.className = 'category-select';

  tags.forEach(tag => {
    const opt = document.createElement('option');
    opt.value = tag;
    opt.textContent = tag;
    select.appendChild(opt);
  });

  titleGroup.append(copyTitleBtn, title, copyLinkBtn, link);
  info.append(company, date, select, titleGroup);
  row.append(info);

  return row;
}

function invalidArticles(articles) {
  if (articles == undefined || articles == null) {
    return true;
  } else if (articles && articles[0] == null) {
    return true;
  } else if (articles && articles[0] != null) {
    return false;
  }
}

function renderArticles(i, articles) {
  console.log(articles);
  const groupDiv = document.getElementsByClassName('company-group')[i]

  if (invalidArticles(articles)) {
    const error = `<br>Unable to scan, please visit <a href="${companies[i].website}" target="_blank">${companies[i].company} News</a>`;
    groupDiv.innerHTML += error;
    return;
  }

  articles.forEach(article => {
    const row = renderArticleRow(companies[i].company, article);
    groupDiv.appendChild(row);
  });
}

function renderCompanies(data = companies) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  data.forEach((group, idx) => {
    const { company, website } = group;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'company-group';

    const title = document.createElement('div');
    title.className = 'company-title';
    title.textContent = company;
    groupDiv.appendChild(title);

    const scanBtn = document.createElement('button');
    scanBtn.textContent = 'Scan';
    scanBtn.addEventListener('click', () => { scan(idx) });
    groupDiv.appendChild(scanBtn)

    // articles.forEach(article => {
    //   const row = renderArticleRow(company, source, article);
    //   groupDiv.appendChild(row);
    // });

    container.appendChild(groupDiv);
  })
}

window.addEventListener('load', fetchCompanies);
