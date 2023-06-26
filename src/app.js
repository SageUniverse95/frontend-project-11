import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import { uniqueId } from 'lodash';
import ru from './locales/ru.js';
import {
  render, renderErorsForm, renderLoadMessage, renderErorsNetwork,
} from './view.js';
// загрузчик rss
const contentUpload = (url) => {
  const address = new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
  return axios.get(address);
};

// функция которая создает массив линков для notOneOf
const createLink = (state) => {
  const links = state.feeds.map(({ url }) => url);
  return links;
};

// Подумать как обойтись без этой функции,
const contenPreparation = (rssContent, url) => {
  const feed = {
    title: rssContent.title,
    description: rssContent.description,
    id: uniqueId(),
    url,
  };
  const posts = rssContent.items.map((item) => ({ ...item, id: feed.id, postID: uniqueId() }));
  return { feed, posts };
};
// Парсер
const rssParse = (rssStream) => {
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

const checkValidate = (url, links) => {
  const schema = yup.string().trim().required().url()
    .notOneOf(links);
  return schema.validate(url);
};
// основная App функция
export default () => {
  const state = {
    form: {
      state: 'filling',
      errors: {},
    },
    modal: {
      modalID: null,
    },
    downloadProcess: {
      state: 'waiting',
      errors: {},
    },

    feeds: [],
    posts: [],
    uiState: {
      listOfViewedPosts: [],
    },
  };
  yup.setLocale({
    mixed: { notOneOf: 'recurringURL' },
    string: { url: 'invalidURL' },
  });
  const defaultLanguage = 'ru';
  const i18Instance = i18next.createInstance();
  i18Instance.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
    },
  })
    .then((i18) => {
      const divWithPosts = document.querySelector('.posts');
      const watchedState = onChange(state, render(state, i18));
      const form = document.querySelector('.rss-form');
      const elements = {
        input: document.querySelector('.form-control'),
      };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const url = data.get('url');
        const links = createLink(state);
        checkValidate(url, links)
          .then(() => {
            watchedState.form.state = 'processed';
            watchedState.downloadProcess.state = 'processing';
            contentUpload(url)
              .then((response) => {
                const rssData = contenPreparation(rssParse(response), url);
                watchedState.downloadProcess.state = 'processed';
                watchedState.feeds.push(rssData.feed);
                watchedState.posts.push(...rssData.posts);
                form.reset();
                renderLoadMessage(state, elements, i18);
              })
              .catch((er) => {
                watchedState.downloadProcess.errors = { errorMessage: er.message };
                watchedState.downloadProcess.state = 'failed';
                renderErorsNetwork(state, elements, i18);
              });
          })
          .catch((er) => {
            watchedState.form.errors = { errorMessage: er.message };
            watchedState.form.state = 'invalid';
            renderErorsForm(state, elements, i18);
          });
      });
      divWithPosts.addEventListener('click', (e) => {
        const currentID = e.target.dataset.id;
        if (currentID) {
          const currentPost = { currentIdPost: currentID };
          watchedState.uiState.listOfViewedPosts.push(currentPost);
          if (e.target.type === 'button') {
            watchedState.modal.modalID = currentID;
          }
        }
      });
      // Функция обновления контента
      const checkUpdate = () => {
        setTimeout(() => {
          if (watchedState.feeds.length) {
            const allUrls = watchedState.feeds;
            allUrls.forEach(({ url }) => {
              contentUpload(url)
                .then((responce) => {
                  const currentPost = contenPreparation(rssParse(responce), url);
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
    });
};
