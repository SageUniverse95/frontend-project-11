import axios from 'axios';

const checkUpdate = (state, createProxy, prepareRssContent, rssParse) => {
  let promises = [];
  setTimeout(() => {
    if (state.feeds.length) {
      promises = state.feeds.map(({ url }) => axios.get(createProxy(url)).then((responce) => {
        const current = prepareRssContent(rssParse(responce), url);
        const oldPosts = state.posts;
        const oldTitles = new Set(oldPosts.map((post) => post.titlePost));
        const items = current.posts.filter(({ titlePost }) => !oldTitles.has(titlePost));
        state.posts.push(...items);
      }).catch(() => {}));
    }
    Promise.all(promises)
      .finally(() => checkUpdate(state, createProxy, prepareRssContent, rssParse));
  }, 5000);
};

export default checkUpdate;
