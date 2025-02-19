import { refs } from './refs';
import { FirebaseService } from './firebaseservice';
import { makeGallaryLibrary } from './templates/renderMoviesLibrary';
import { changeHeaderBg } from './load-header-bg-img';
import { emailCuter } from './authorization';
import { switchGalleryTitleLibraryDarkTheme } from './colorSwitcher';
import { onTrendMovies } from './myLibrary';
const {
  search,
  libraryBtn,
  homeBtn,
  gallery,
  libraryFilter,
  logo,
  pagEl,
  filterContainer,
  galleryMain,
  galleryLibrary,
  gallerySection__gallery,
  smaiImage,
  textSearchError,
} = refs;
// import { makeGallaryLibrary } from './templates/renderMoviesLibrary';
// import { pagination } from './pagination';
import { ApiServise } from './apiServise';
export const apiServise = new ApiServise();

const firebase = new FirebaseService();
changeHeaderBg(null, 'home-bg-img');
// function openLibrary() {
//   // if

//   search.classList.add('visually-hidden');
//   libraryFilter.classList.remove('visually-hidden');
// }

export async function openLibrary(user) {
  changeHeaderBg('home-bg-img', 'library-bg-img');

  // gallery.innerHTML = '';
  homeBtn.addEventListener('click', openHome);
  search.classList.add('visually-hidden');
  libraryFilter.classList.remove('visually-hidden');
  homeBtn.classList.remove('nav-list__link--selected');
  libraryBtn.classList.add('nav-list__link--selected');
  pagEl.classList.add('visually-hidden');
  filterContainer.classList.add('visually-hidden');

  galleryLibrary.classList.remove('visually-hidden');
  galleryLibrary.classList.add('library');

  if (galleryLibrary.classList.contains('library')) {
    if (gallerySection__gallery.children[3] == galleryMain) {
      gallerySection__gallery.removeChild(galleryMain);
    }
    if (refs.watchedBtn.classList.contains('library__btn--selected')) {
      refs.watchedBtn.classList.remove('library__btn--selected');
      refs.queueBtn.classList.add('library__btn--selected');
    }
    smaiImage.classList.add('is-hidden');
    textSearchError.classList.add('is-hidden');
  }
  refs.switchColorCheckbox.parentNode.parentNode.parentNode.classList.add(
    'is-library-open'
  );
  if (user !== null) {
    const data = await firebase.GetUserQueue(emailCuter(user.email));
    makeGallaryLibrary(data);
    switchGalleryTitleLibraryDarkTheme(refs);
  }
}

function openHome() {
  location.reload();
  // homeBtn.classList.add('nav-list__link--selected');
  // libraryBtn.classList.remove('nav-list__link--selected');
  // gallery.innerHTML = '';
  // search.classList.remove('visually-hidden');
  // libraryFilter.classList.add('visually-hidden');
  //TODO: замінити релоад сторінки на перерендер карток
}

logo.addEventListener('click', openHome);
homeBtn.removeEventListener;
