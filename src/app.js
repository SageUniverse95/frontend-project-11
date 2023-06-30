import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import { uniqueId } from 'lodash';
import ru from './locales/ru.js';
import rssParse from './parser.js';
import render from './view.js';

const contentUpload = (url) => {
  const address = new URL('/get', 'https://allorigins.hexlet.app');
  address.searchParams.set('disableCache', 'true');
  address.searchParams.set('url', `${url}`);
  return axios.get(address);
};

const createLink = (state) => {
  const links = state.feeds.map(({ url }) => url);
  return links;
};

const prepareRssContent = (rssContent, url) => {
  const feed = {
    title: rssContent.title,
    description: rssContent.description,
    id: uniqueId(),
    url,
  };
  const posts = rssContent.items.map((item) => ({ ...item, id: feed.id, postID: uniqueId() }));
  return { feed, posts };
};

const checkValidate = (url, links) => {
  const schema = yup.string().trim().required().url()
    .notOneOf(links);
  return schema.validate(url);
};

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
      const elements = {
        main: {
          input: document.querySelector('.form-control'),
          p: document.querySelector('.feedback'),
          form: document.querySelector('.rss-form'),
          btn: document.querySelector('[type="submit"]'),
        },
        modal: {
          header: document.querySelector('.modal-header > h5'),
          body: document.querySelector('.modal-body'),
          footer: document.querySelector('.modal-footer > a'),
        },
      };
      const watchedState = onChange(state, render(state, elements, i18));
      const form = document.querySelector('.rss-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const url = data.get('url');
        const links = createLink(state);
        watchedState.form.state = 'processing';
        checkValidate(url, links)
          .then(() => {
            watchedState.form.state = 'processed';
            watchedState.downloadProcess.state = 'processing';
            contentUpload(url)
              .then((response) => {
                const rssData = prepareRssContent(rssParse(response), url);
                watchedState.downloadProcess.state = 'processed';
                watchedState.feeds.push(rssData.feed);
                watchedState.posts.push(...rssData.posts);
                form.reset();
              })
              .catch((er) => {
                watchedState.downloadProcess.errors = er;
                watchedState.downloadProcess.state = 'failed';
              });
          })
          .catch((er) => {
            er.isValidationError = true;
            watchedState.form.errors = er;
            watchedState.form.state = 'invalid';
          });
      });
      divWithPosts.addEventListener('click', (e) => {
        const currentID = e.target.dataset.id;
        if (currentID) {
          const currentPost = { currentIdPost: currentID };
          watchedState.uiState.listOfViewedPosts.push(currentPost);
          watchedState.modal.modalID = currentID;
        }
      });

      const checkUpdate = () => {
        const promises = [];
        setTimeout(() => {
          if (watchedState.feeds.length) {
            const allUrls = watchedState.feeds;
            allUrls.forEach(({ url }) => {
              promises.push(contentUpload(url));
              promises.forEach((promise) => {
                promise.then((responce) => {
                  const current = prepareRssContent(rssParse(responce), url);
                  const oldPosts = watchedState.posts;
                  const oldTitles = new Set(oldPosts.map((post) => post.titlePost));
                  const items = current.posts.filter(({ titlePost }) => !oldTitles.has(titlePost));
                  watchedState.posts.push(...items);
                })
                  .catch(() => {});
              });
            });
          }
          Promise.all(promises)
            .finally(() => checkUpdate());
        }, 5000);
      };
      checkUpdate();
    });
};
