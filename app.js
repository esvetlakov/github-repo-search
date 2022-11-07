class Render {
  constructor() {
    this.app = document.getElementById("app");

    this.searchWrap = this.createElem("div", "search-wrap");
    this.searchInput = this.createElem("input", "search-input");
    this.searchInput.placeholder = "Что будем искать?";
    this.searchList = this.createElem("ul", "search-ul");

    this.favWrap = this.createElem("div", "fav-wrap");
    this.favList = this.createElem("ul", "fav-ul");

    this.app.append(this.searchWrap);
    this.searchWrap.append(this.searchInput);
    this.searchWrap.append(this.searchList);
    this.app.append(this.favWrap);
    this.favWrap.append(this.favList);
  }

  createElem(elemTag, elemClass) {
    const element = document.createElement(elemTag);
    if (elemClass) {
      element.classList.add(elemClass);
    }
    return element;
  }

  createSearchListItem(elem) {
    const item = this.createElem("li", "search-li");
    item.textContent = elem.name;
    item.dataset.name = elem.name;
    item.dataset.owner = elem.owner.login;
    item.dataset.stars = elem.stargazers_count;
    this.searchList.append(item);
  }

  removeSearchListItems() {
    while (this.searchList.hasChildNodes()) {
      this.searchList.removeChild(this.searchList.firstChild);
    }
  }
}

class Search {
  constructor(render) {
    this.render = render;
    this.render.searchInput.addEventListener("keyup", this.debounce(this.searchRepos.bind(this), 500));
    this.render.searchList.addEventListener("click", this.addToFavorites.bind(this));
  }

  debounce(fn, debounceTime) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, debounceTime);
    };
  }

  async searchRepos() {
    if (this.render.searchInput.value == "") {
      return await this.render.removeSearchListItems();
    } else {
      return await fetch(`https://api.github.com/search/repositories?q=${this.render.searchInput.value}&per_page=5`).then((res) => {
          res.json().then((res) => {
            this.render.removeSearchListItems();
            res.items.forEach((element) => this.render.createSearchListItem(element));
          }).catch(console.log);
      });
    }
  }

  addToFavorites(evt) {
    const data = evt.target.dataset;
    let elem = this.render.createElem("li", "fav-li");
    let btn = this.render.createElem('button', 'fav-del');
    btn.addEventListener('click', function() {
        elem.remove()
    })
    elem.innerHTML = `<div class="fav-item">
                        <span>Name: ${data.name}</span>
                        <span>Owner: ${data.owner}</span>
                        <span>Stars: ${data.stars}</span>
                      </div>`;
    elem.append(btn)
    this.render.favList.append(elem);
    this.render.removeSearchListItems();
    this.render.searchInput.value = "";
  }

}

new Search(new Render());
