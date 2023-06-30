const checkUpdate = (watchedState, contentUpload, prepareRssContent, rssParse) => {
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
      .finally(() => checkUpdate(watchedState, contentUpload, prepareRssContent, rssParse));
  }, 5000);
};
export default checkUpdate;
