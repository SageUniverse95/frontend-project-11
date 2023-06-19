import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import ru from './locales/ru.js';

const rssParser = (rssStream) => {
  const parser = new DOMParser();
  const rssContent = parser.parseFromString(rssStream.data.contents, 'application/xml');
  if (rssContent.querySelector('parsererror')) {
    throw new Error('invalidRSS');
  }
  const feedContent = Array.from(rssContent.getElementsByTagName('channel'))
    .map((channel) => {
      const feedTitle = channel.querySelector('title').textContent;
      const feedDescription = channel.querySelector('description').textContent;
      const result = {
        feedTitle,
        feedDescription,
      };
      return result;
    });
  const postsContent = Array.from(rssContent.querySelectorAll('item'))
    .map((post) => {
      const title = post.querySelector('title').textContent;
      const description = post.querySelector('description').textContent;
      const link = post.querySelector('link').textContent;
      const result = {
        title,
        description,
        link,
      };
      return result;
    });
  return [feedContent, postsContent];
};

const render = (path, value, prevValue) => {
  console.log(path, value);
};

const checkValidate = (url, links) => {
  const schema = yup.string().trim().required().url()
    .notOneOf(links);
  return schema.validate(url);
};

export default () => {
  const state = {
    rssForm: {
      valid: true,
      field: {
        url: [],
      },
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
  const watchedState = onChange(state, render);
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    const links = watchedState.rssForm.field.url;
    checkValidate(url, links)
      .then(() => {
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
          .then((response) => {
            const data = rssParser(response);
            console.log(data);
            watchedState.rssForm.field.url.push(url);
          })
          .catch((er) => {
            watchedState.errors = er.message;
          });
      })
      .catch((er) => {
        watchedState.errors = er.message;
      });
  });
};
