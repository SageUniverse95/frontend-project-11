const render = (state, i18) => (path, value) => {
  /* const inputTest = document.querySelector('[id="url-input"]');
  inputTest.focus(); */
  if (path === 'uiState.listOfViewedPosts') {
    value.forEach(({ currentIdPost }) => {
      const testPost = document.querySelector(`[data-id="${currentIdPost}"]`);
      testPost.classList.remove('fw-bold');
      testPost.classList.add('fw-normal', 'link-secondary');
    });
  }
  if (path === 'modal.modalID') {
    const modalHeader = document.querySelector('.modal-header > h5');
    const modalBody = document.querySelector('.modal-body');
    const modalFooter = document.querySelector('.modal-footer > a');
    const currentPostForModal = state.posts.filter(({ postID }) => postID === value);
    currentPostForModal.forEach(({ titlePost, descriptionPost, link }) => {
      modalHeader.textContent = titlePost;
      modalBody.textContent = descriptionPost;
      modalFooter.href = link;
    });
  }
  if (path === 'downloadProcess.state') {
    const btn = document.querySelector('[type="submit"]');
    const input = document.querySelector('[id="url-input"]');
    if (value === 'processing') {
      btn.disabled = true;
      input.disabled = true;
    }
    if (value === 'processed') {
      btn.disabled = false;
      input.disabled = false;
    }
    if (value === 'failed') {
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
      button.textContent = i18('buttons.viewBtn');
      state.uiState.listOfViewedPosts.forEach(({ currentIdPost }) => {
        if (currentIdPost === postID) {
          a.classList.add('fw-normal', 'link-secondary');
          a.classList.remove('fw-bold');
        }
      });
      li.append(a, button);
      return li;
    });
    titleForPosts.textContent = i18('titles.posts');
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
    titleForFeeds.textContent = i18('titles.feeds');
    ulForFeeds.append(...elementLi);
    divCardBodyFeeds.append(titleForFeeds);
    divCardBorderFeeds.append(divCardBodyFeeds, ulForFeeds);
    mainContainerForFeeds.append(divCardBorderFeeds);
  }
};
const renderLoadMessage = (state, elements, i18) => {
  if (state.downloadProcess.state === 'processed') {
    const inputTest = document.querySelector('[id="url-input"]');
    const test = document.querySelector('.rss-form');
    test.reset();
    inputTest.focus();
    const pWithLodaedMessage = document.querySelector('.feedback');
    pWithLodaedMessage.textContent = i18('statusMessages.loaded');
    pWithLodaedMessage.classList.remove('text-danger');
    pWithLodaedMessage.classList.add('text-success');
    elements.input.classList.remove('is-invalid');
  }
};
const renderErorsForm = (state, elements, i18) => {
  const pWithErrorMessage = document.querySelector('.feedback');
  const { errorMessage } = state.form.errors;
  pWithErrorMessage.classList.add('text-danger');
  pWithErrorMessage.textContent = i18(`errors.${errorMessage}`);
  elements.input.classList.add('is-invalid');
};

const renderErorsNetwork = (state, elements, i18) => {
  const { errorMessage } = state.downloadProcess.errors;
  const pWithErrorMessage = document.querySelector('.feedback');
  if (errorMessage === 'Network Error') {
    pWithErrorMessage.textContent = i18('errors.networkError');
  } else {
    pWithErrorMessage.textContent = i18(`errors.${errorMessage}`);
    elements.input.classList.remove('is-invalid');
  }
};
export {
  render,
  renderErorsForm,
  renderLoadMessage,
  renderErorsNetwork,
};
