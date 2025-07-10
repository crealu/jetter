const tags = ['Fin', 'Info', 'Conf', 'Sales', 'Met', 'MA', 'Org'];
let articleData = [];
let companyData = [];

async function scanSelect() {
  let n = 0;

  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({number: n})
  }

  await fetch('https://jetscan-fcaf0aedc4e1.herokuapp.com/scan-one', options)
    .then(res => res.json())
    .then(data => { console.lo(data) })
    .catch(err => { console.log(err) })
}

async function fetchArticles() {
  const res = await fetch('/publisher');
  articleData = await res.json();
  console.log(articleData)
  renderArticles();
}

async function fetchCompanies() {
  const res = await fetch('/publisher');
  companyData = await res.json();
  console.log(companyData)
  renderCompanies();
}

function renderArticleRow(companyName, source, article) {
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

function renderCompanies(data = companyData) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  data.forEach(group => {
    const { company, source, articles } = group;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'company-group';

    const title = document.createElement('div');
    title.className = 'company-title';
    title.textContent = company;
    groupDiv.appendChild(title);

    const scanBtn = document.createElement('button');

    articles.forEach(article => {
      const row = renderArticleRow(company, source, article);
      groupDiv.appendChild(row);
    });

    container.appendChild(groupDiv);
  })
}

function renderArticles(data = articleData) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  data.forEach(group => {
    const { company, source, articles } = group;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'company-group';

    const title = document.createElement('div');
    title.className = 'company-title';
    title.textContent = company;
    groupDiv.appendChild(title);


    articles.forEach(article => {
      const row = renderArticleRow(company, source, article);
      groupDiv.appendChild(row);
    });

    container.appendChild(groupDiv);
  })
}

window.addEventListener('load', fetchCompanies);
// window.addEventListener('load', fetchArticles);
