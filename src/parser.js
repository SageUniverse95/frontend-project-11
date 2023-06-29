export default (rssStream) => {
  const parser = new DOMParser();
  const rssContent = parser.parseFromString(rssStream.data.contents, 'application/xml');
  const parseError = rssContent.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
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
