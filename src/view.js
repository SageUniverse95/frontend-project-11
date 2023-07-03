const renderListOfViewedPosts = (state) => {
  state.forEach(({ currentIdPost }) => {
    const currentPost = document.querySelector(`[data-id="${currentIdPost}"]`);
    currentPost.classList.remove('fw-bold');
    currentPost.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModal = (state, currentId, elements) => {
  const currentPostForModal = state.posts.filter(({ postID }) => postID === currentId);
  currentPostForModal.forEach(({ titlePost, descriptionPost, link }) => {
    elements.modal.header.textContent = titlePost;
    elements.modal.body.textContent = descriptionPost;
    elements.modal.footer.href = link;
  });
};

const renderErrors = (state, elements, i18) => {
  if (state.form.errors.isValidationError) {
    elements.main.p.classList.add('text-danger');
    elements.main.p.textContent = i18(`errors.${state.form.errors.message}`);
    elements.main.input.classList.add('is-invalid');
  }
  if (state.downloadProcess.errors.isParsingError) {
    elements.main.p.textContent = i18(`errors.${state.downloadProcess.errors.message}`);
    elements.main.input.classList.remove('is-invalid');
  }
  if (state.downloadProcess.errors.isAxiosError) {
    elements.main.p.textContent = i18(`errors.${state.downloadProcess.errors.message}`);
  }
};

const renderLoadMessage = (state, elements, i18) => {
  if (state === 'processing') {
    elements.main.btn.disabled = true;
    elements.main.input.disabled = true;
  }
  if (state === 'processed') {
    elements.main.form.reset();
    elements.main.btn.disabled = false;
    elements.main.input.disabled = false;
    elements.main.p.textContent = i18('statusMessages.loaded');
    elements.main.p.classList.remove('text-danger');
    elements.main.p.classList.add('text-success');
    elements.main.input.classList.remove('is-invalid');
    elements.main.input.focus();
  }
  if (state === 'failed') {
    elements.main.btn.disabled = false;
    elements.main.input.disabled = false;
  }
};

export default (state, elements, i18) => (path, value) => {
  if (path === 'downloadProcess.state') {
    if (value === 'failed') {
      renderErrors(state, elements, i18);
    }
  }
  if (path === 'form.state') {
    if (value === 'processing') {
      elements.main.input.disabled = true;
      elements.main.btn.disabled = true;
    }
    if (value === 'processed') {
      elements.main.input.disabled = false;
      elements.main.btn.disabled = false;
    }
    if (value === 'invalid') {
      renderErrors(state, elements, i18);
      elements.main.input.disabled = false;
      elements.main.btn.disabled = false;
    }
  }
  if (path === 'uiState.listOfViewedPosts') {
    renderListOfViewedPosts(value);
  }
  if (path === 'modal.modalID') {
    renderModal(state, value, elements);
  }
  if (path === 'downloadProcess.state') {
    renderLoadMessage(value, elements, i18);
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
