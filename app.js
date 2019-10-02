// Домашнее задание:

// 1. Добавить возможность выбора категорий для поиска новостей

// 2. Получать ресурсы от API и выводить их в селект. Соответствунно добавить возможность выбора ресурса по которому хотим получить новости.

function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

function newsServiceModule() {
  const apiUrl = 'https://newsapi.org';
  const apiKey = '9c27b0f722b84da5a08312d2b125351b';
  const categories = document.querySelector('#categories');
  return {
    topHeadlines(country, cb) {
      http.get(`${apiUrl}/v2/top-headlines?country=${country}&category=${categories.value}&apiKey=${apiKey}`, cb);
    },
    everything(text, cb) {
      http.get(`${apiUrl}/v2/everything?q=${text}&sources=${sources.value}&apiKey=${apiKey}`, cb);
    },
    source(cb) {
      http.get(`${apiUrl}/v2/sources?&language=en&apiKey=${apiKey}`, cb) // Гет запрос на список ресурсов (выбрал только те, что на англ языке)
    }
  }
}

const http = customHttp();
const newsService = newsServiceModule();

const sources = document.querySelector('#sources');
const newsContainer = document.querySelector('.news-container .row');
const form = document.forms['newsControls'];
const countrySelect = form['country'];
const searchInput = form['search'];



// Функция для заполнения селекта новостными ресурсами


function createSourceOptions(err, response) {
  const sourceArray = response.sources;

  for (let i = 0; i <= 15; i++) {
    const newSourceOption = `
    <option value=${sourceArray[i].id}>${sourceArray[i].name}</option>
    `;

    sources.insertAdjacentHTML('beforeend', newSourceOption);
    M.FormSelect.init(sources, newSourceOption);
  }
}

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  showLoader();
  loadNews();
  newsService.source(createSourceOptions);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  showLoader();

  if (searchInput.value) {
    newsService.everything(searchInput.value, onGetResponse);
  } else {
    newsService.topHeadlines(countrySelect.value, onGetResponse);
  }
});

// При загрузке мы должны получить дефолтные новости
//  - функция loadNews
//  - OnGetResponse
//  - newstTemplate
function loadNews() {
  newsService.topHeadlines(countrySelect.value, onGetResponse);
}

function onGetResponse(err, res) {
  hideLoader();
  if (err) {
    console.warn(err);
    return;
  }

  if (!res.articles.length) {
    M.toast({ html: 'Новости по вашему запросу не найдены!' });
    return;
  }

  renderNews(res.articles);
}

function renderNews(news) {
  clearContainer();

  let fragment = '';
  news.forEach(item => {
    const template = newsTemplate(item);
    fragment += template;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

function clearContainer() {
  newsContainer.innerHTML = '';
}

function newsTemplate({ title, urlToImage, url, description }) {
  return `
  <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${urlToImage || 'img/empty.jpg'}">
        <span class="card-title">${title || ''}</span>
      </div>
      <div class="card-content">
        <p>${description || ''}</p>
      </div>
      <div class="card-action">
        <a href="${url}">Read more</a>
      </div>
    </div>
  </div>
  `;
}

// При изменении формы выводим полученные новости или если новостей нет то выводим уведомление
// При каждой загрузке новостей показывать прелодер
function showLoader() {
  const template = `
  <div class="progress">
    <div class="indeterminate"></div>
  </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', template);
}

function hideLoader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}