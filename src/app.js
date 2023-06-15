import onChange from 'on-change';
import * as yup from 'yup';

const render = (path, value, prevValue) => {

};
const schema = yup.object().shape({
  urlInput: yup.string().url(),
});
export default () => {
  const state = {
    rssForm: {
      valid: true,
      field: {
        urlInput: '',
      },
    },
    errors: {},
  };
  const watchedState = onChange(state, render);
  const form = document.querySelector('.rss-form');
  form.addEventListener('input', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    console.log(data.get('name'));
  });
};
