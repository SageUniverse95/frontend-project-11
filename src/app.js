import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import ru from './locales/ru.js';

const rssParser = (rssStream) => {
  const parser = new DOMParser();
  const res = parser.parseFromString(rssStream.data.contents, 'text/html');
  console.log(res);
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
        const response = axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
          .then((answer) => {
            const data = rssParser(answer);
          })
          .catch((er) => console.log(er));

        watchedState.rssForm.field.url.push(url);
      })
      .catch((er) => {
        watchedState.errors = er.message;
      });
  });
};
