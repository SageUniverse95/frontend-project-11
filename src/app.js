import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import { uniqueId } from 'lodash';
import ru from './locales/ru.js';

const renderErors = (errors, elements, i18Instance) => {
  const pWithErrorMessage = document.querySelector('.feedback');
  pWithErrorMessage.classList.add('text-danger');
  pWithErrorMessage.textContent = i18Instance.t(`errors.${errors}`);
  elements.input.classList.add('is-invalid');
  if (errors === 'invalidRSS') {
    pWithErrorMessage.textContent = i18Instance.t(`errors.${errors}`);
    elements.input.classList.remove('is-invalid');
  }
};

const renderLoadMessage = (elements, i18Instance) => {
  const pWithLodaedMessage = document.querySelector('.feedback');
  pWithLodaedMessage.textContent = i18Instance.t('statusMessages.loaded');
  pWithLodaedMessage.classList.remove('text-danger');
  pWithLodaedMessage.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
};

const createID = (rssContent) => {
  const feed = {
    title: rssContent.title,
    description: rssContent.description,
    id: uniqueId(),
  };
  const posts = rssContent.items.map((item) => ({ ...item, id: feed.id, postID: uniqueId() }));
  return { feed, posts };
};

const rssParser = (rssStream) => {
  const parser = new DOMParser();
  const rssContent = parser.parseFromString(rssStream.data.contents, 'application/xml');
  if (rssContent.querySelector('parsererror')) {
    throw new Error('invalidRSS');
  }
  const feedContent = rssContent.querySelector('channel');
  const title = feedContent.querySelector('title').textContent;
  const description = feedContent.querySelector('description').textContent;
  const items = Array.from(rssContent.querySelectorAll('item'))
    .map((post) => {
      const titlePost = post.querySelector('title').textContent;
      const descriptionPost = post.querySelector('description').textContent;
      const link = post.querySelector('link').textContent;
      const result = {
        titlePost,
        descriptionPost,
        link,
      };
      return result;
    });
  return { title, description, items };
};

const render = (state) => (path, value) => {
  const inputTest = document.querySelector('[id="url-input"]');
  inputTest.focus();
  if (path === 'uiState.listOfViewedPosts') {
    value.forEach(({ currentIdPost }) => {
      const testPost = document.querySelector(`[data-id="${currentIdPost}"]`);
      testPost.classList.remove('fw-bold');
      testPost.classList.add('fw-normal', 'link-secondary');
    });
  }
  if (path === 'uiState.modalID') {
    const modalHeader = document.querySelector('.modal-header > h5');
    const modalBody = document.querySelector('.modal-body');
    const modalFooter = document.querySelector('.modal-footer > a');
    const currentPostForModal = state.posts.filter(({ postID }) => postID === value);
    console.log(currentPostForModal);
    currentPostForModal.forEach(({ titlePost, descriptionPost, link }) => {
      modalHeader.textContent = titlePost;
      modalBody.textContent = descriptionPost;
      modalFooter.href = link;
    });
  }
  if (path === 'rssForm.processState') {
    const btn = document.querySelector('[type="submit"]');
    const input = document.querySelector('[id="url-input"]');
    if (value === 'loading') {
      btn.disabled = true;
      input.disabled = true;
    }
    if (value === 'loadingIsComplete') {
      btn.disabled = false;
      input.disabled = false;
    }
    if (value === 'loadingIsFail') {
      btn.disabled = false;
      input.disabled = false;
    }
  }
  if (path === 'posts') {
    const mainContainerForPosts = document.querySelector('.posts');
    const divCardBorderPost = document.createElement('div');
    const divCardBodyPost = document.createElement('div');
    const titleForPosts = document.createElement('h2');
    const ulForPosts = document.createElement('ul');

    divCardBorderPost.classList.add('card', 'border-0');
    divCardBodyPost.classList.add('card-body');
    titleForPosts.classList.add('card-title', 'h4');
    ulForPosts.classList.add('list-group', 'border-0', 'rounded-0');
    const elementLi = value.map(({
      titlePost, link, postID,
    }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const button = document.createElement('button');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      a.href = link;
      a.classList.add('fw-bold');
      a.dataset.id = postID;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = titlePost;
      button.type = 'button';
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.dataset.id = postID;
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = 'Просмотр';
      state.uiState.listOfViewedPosts.forEach(({ currentIdPost }) => {
        if (currentIdPost === postID) {
          a.classList.add('fw-normal', 'link-secondary');
          a.classList.remove('fw-bold');
        }
      });
      li.append(a, button);
      return li;
    });
    titleForPosts.textContent = 'Посты';
    divCardBodyPost.append(titleForPosts);
    ulForPosts.innerHTML = '';
    ulForPosts.append(...elementLi);
    divCardBorderPost.append(divCardBodyPost, ulForPosts);
    mainContainerForPosts.innerHTML = '';
    mainContainerForPosts.append(divCardBorderPost);
  }
  if (path === 'feeds') {
    const mainContainerForFeeds = document.querySelector('.feeds');
    const divCardBorderFeeds = document.createElement('div');
    const divCardBodyFeeds = document.createElement('div');
    const titleForFeeds = document.createElement('h2');
    const ulForFeeds = document.createElement('ul');

    divCardBorderFeeds.classList.add('card', 'border-0');
    divCardBodyFeeds.classList.add('card-body');
    titleForFeeds.classList.add('card-title', 'h4');
    ulForFeeds.classList.add('list-group', 'border-0', 'rounded-0');
    const elementLi = value.map(({ title, description }) => {
      const li = document.createElement('li');
      const h3 = document.createElement('h3');
      const p = document.createElement('p');

      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      h3.classList.add('h6', 'm-0');
      p.classList.add('m-0', 'small', 'text-black-50');

      h3.textContent = title;
      p.textContent = description;
      li.append(h3, p);
      return li;
    });
    mainContainerForFeeds.innerHTML = '';
    titleForFeeds.textContent = 'Фиды';
    ulForFeeds.append(...elementLi);
    divCardBodyFeeds.append(titleForFeeds);
    divCardBorderFeeds.append(divCardBodyFeeds, ulForFeeds);
    mainContainerForFeeds.append(divCardBorderFeeds);
  }
};

const checkValidate = (url, links) => {
  const schema = yup.string().trim().required().url()
    .notOneOf(links);
  return schema.validate(url);
};

export default () => {
  const state = {
    rssForm: {
      processState: 'filling',
      field: {
        url: [],
      },
    },
    uiState: {
      listOfViewedPosts: [],
      modalID: null,
    },
    feeds: [],
    posts: [],
    errors: {},
  };
  const defaultLanguage = 'ru';
  const i18Instance = i18next.createInstance();
  i18Instance.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
    },
  });
  yup.setLocale({
    mixed: { notOneOf: 'recurringURL' },
    string: { url: 'invalidURL' },
  });
  const divWithPosts = document.querySelector('.posts');
  const watchedState = onChange(state, render(state));
  const form = document.querySelector('.rss-form');
  const elements = {
    input: document.querySelector('.form-control'),
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    const links = watchedState.rssForm.field.url;
    checkValidate(url, links)
      .then(() => {
        watchedState.rssForm.processState = 'loading';
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
          .then((response) => {
            const rssData = createID(rssParser(response));
            watchedState.rssForm.processState = 'loadingIsComplete';
            watchedState.rssForm.field.url.push(url);
            watchedState.feeds.push(rssData.feed);
            watchedState.posts.push(...rssData.posts);
            form.reset();
            renderLoadMessage(elements, i18Instance);
          })
          .catch((er) => {
            watchedState.errors = er.message;
            watchedState.rssForm.processState = 'loadingIsFail';
            renderErors(watchedState.errors, elements, i18Instance);
          });
      })
      .catch((er) => {
        watchedState.errors = er.message;
        renderErors(watchedState.errors, elements, i18Instance);
      });
  });
  divWithPosts.addEventListener('click', (e) => {
    const currentID = e.target.dataset.id;
    if (currentID) {
      const currentPost = { currentIdPost: currentID };
      watchedState.uiState.listOfViewedPosts.push(currentPost);
      if (e.target.type === 'button') {
        watchedState.uiState.modalID = currentID;
      }
    }
  });
  // Функция обновления контента
  const checkUpdate = () => {
    setTimeout(() => {
      if (watchedState.rssForm.field.url.length) {
        const allUrls = watchedState.rssForm.field.url;

        allUrls.forEach((url) => {
          axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
            .then((responce) => {
              const currentPost = createID(rssParser(responce));
              const oldPosts = watchedState.posts;
              const items = currentPost.posts.filter(({ titlePost }) => !oldPosts.some((post) => post.titlePost === titlePost));
              watchedState.posts.push(...items);
            })
            .catch(() => {});
        });
      }
      checkUpdate();
    }, 5000);
  };
  checkUpdate();
};
