import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/dist/basicLightbox.min.css';
import { ApiServise } from './apiServise';
import { refs } from './refs';
import { FirebaseService } from './firebaseservice';
import { emailCuter } from './authorization';
import { addModalBtn } from './modal-btn';
import defPoster from '../images/no-poster.png';

import { async } from '@firebase/util';

const firebase = new FirebaseService();
import { modalBtnRefs } from './modal-btn';

const details = {
  filmTitle: document.querySelector('.film_title'),
  largePoster: document.querySelector('source.large'),
  mediumPoster: document.querySelector('source.medium'),
  smallPoster: document.querySelector('source.small'),
  poster: document.querySelector('img[alt="moviesPoster"]'),
  voteAverage: document.querySelector('.vote_average'),
  voteCount: document.querySelector('.vote_count'),
  popularity: document.querySelector('.popularity'),
  originalTitle: document.querySelector('.original_title'),
  genres: document.querySelector('.genres'),
  description: document.querySelector('.description'),
  toHide: document.querySelector('[data-modal]'),
  toCloseModal: document.querySelector('.close-btn'),
  titleInfo: document.querySelector('.title_item_info'),
  modalWindow: document.querySelector('.backdrop'),
  modalBtns: document.querySelector('.btn_wraper'),
};

const closeModalBtn = document.querySelector('.close-btn');
const body = document.querySelector('body');

details.toCloseModal.addEventListener('click', toggleModalAndScroll);

const API_KEY = 'e4c439da3c1d90110fb4595b6236c9fe';

function toggleModalAndScroll() {
  details.toHide.classList.toggle('is-hidden');
  noScrollBody();
  buttonListenerOnModal();
  details.poster.src = '';
}
function noScrollBody() {
  body.classList.toggle('no-scroll');
}

function buttonListenerOnModal() {
  if (!details.toHide.classList.contains('is-hidden')) {
    details.modalWindow.addEventListener('click', onBackDropClick);
    window.addEventListener('keydown', closeModalOnEscape);
  } else {
    details.modalWindow.removeEventListener('click', onBackDropClick);
    window.removeEventListener('keydown', closeModalOnEscape);
  }
}

function closeModalOnEscape(e) {
  if (e.code !== 'Escape') return;
  toggleModalAndScroll();
}

function onBackDropClick(e) {
  if (e.target !== e.currentTarget) return;
  toggleModalAndScroll();
}

const apiId = new ApiServise();
let cardID;

export function clickOnFilm(e) {
  if (!e.target.closest('.gallery__item')) return;
  const { addWatched, removeWatched, addQueue, removeQueue } = modalBtnRefs;

  cardID = e.target.closest('.gallery__item').dataset.id;

  toggleModalAndScroll(e);

  let movieID = e.target.closest('.gallery__item').dataset.id;
  fetch(
    `https://api.themoviedb.org/3/movie/${movieID}$?api_key=${API_KEY}&$&language=en-US`
  )
    .then(response => {
      return response.json('');
    })
    .then(info => {
      const i = [];
      for (const genre of info.genres) {
        i.push(genre.name);
      }
      apiId.movieId = movieID;
      const ganreString = i.join();
      const {
        title,
        vote_average,
        vote_count,
        popularity,
        original_title,
        overview,
        poster_path,
      } = info;
      const toLibrary = {
        movieID,
        title,
        vote_average,
        vote_count,
        popularity,
        original_title,
        overview,
        poster_path,
        ganreString,
      };

      details.titleInfo.innerHTML = JSON.stringify(toLibrary);
      details.filmTitle.textContent = title;
      details.voteAverage.textContent = vote_average;
      details.voteCount.textContent = vote_count;
      details.popularity.textContent = popularity;
      details.originalTitle.textContent = original_title;
      details.genres.textContent = i;
      details.description.textContent = overview;

      details.poster.src = poster_path
        ? `https://image.tmdb.org/t/p/w300${poster_path}`
        : defPoster;
      // details.largePoster.srcset = `https://image.tmdb.org/t/p/w1024${info.poster_path}`;
      // details.mediumPoster.srcset = `https://image.tmdb.org/t/p/w500${info.poster_path}`;
      // details.smallPoster.srcset = `https://image.tmdb.org/t/p/w320${info.poster_path}`;
    })
    .catch(error => {
      console.log(error);
    });
}

//Open video player and watch trailer

refs.openVideoBtn.addEventListener('click', createVideo);

async function createVideo() {
  const res = await apiId.fetchOpenMovieByPlayer();
  const results = res.results[0].key;

  const player = basicLightbox.create(
    ` <iframe class = "video_frame"

  src="https://www.youtube.com/embed/${results}"
  title="YouTube video player"
  frameborder="0"
  autoplay = "1"
  allow="accelerometer; allowfullscreen = false; clipboard-write; controls=1; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
      </br>
      <button type="button" class="videoBtnClose  is-hidden">Close Trailer</i></button>
    `,
    {
      onShow: player => {
        player.element().querySelector('.videoBtnClose').onclick = player.close;
        return player;
      },
    }
  );

  player.show();

  window.addEventListener('keydown', closeTrailer);
  const videoBtnClose = document.querySelector('.videoBtnClose');
  setTimeout(() => {
    videoBtnClose.classList.remove('is-hidden');
  }, 10000);

  function closeTrailer(e) {
    if (e.code === 'Escape') {
      player.close();
      window.addEventListener('keydown', closeTrailer);
    }
  }
}

refs.trailerBtnWraper.addEventListener('mouseenter', changeOpenVideoText);

function changeOpenVideoText() {
  const title = details.originalTitle.textContent;
  refs.openVideoBtn.textContent = title;
  refs.openVideoBtn.style.color = '#ff6b08';
}

refs.trailerBtnWraper.addEventListener('mouseleave', onCangeTextVideoBtn);

function onCangeTextVideoBtn() {
  refs.openVideoBtn.textContent = 'Watch Trailer';
  refs.openVideoBtn.style.color = '#000000';
}

export async function compareID(movieId, user) {
  if (movieId == null) return;
  const wachedData = await firebase.getMovieToWachedById(
    movieId,
    emailCuter(user.email)
  );
  const queueyData = await firebase.getMovieToQueueyById(
    movieId,
    emailCuter(user.email)
  );
  const { addWatched, removeWatched, addQueue, removeQueue } = modalBtnRefs;

  if (wachedData == null) {
    // console.log('В wached БД нет такого фильма:(');
    refs.wached.textContent = addWatched.text;
    refs.wached.dataset.action = addWatched.act;
  }
  if (wachedData !== null) {
    refs.wached.textContent = removeWatched.text;
    refs.wached.dataset.action = removeWatched.act;
  }

  if (queueyData == null) {
    // console.log('В queuey БД нет такого фильма:(');
    refs.queue.textContent = addQueue.text;
    refs.queue.dataset.action = addQueue.act;
  }
  if (queueyData !== null) {
    // console.log('Есть фильм в БД? ДА в queuey его id:', queueyData.id);
    // console.log('cardID', movieId);
    refs.queue.textContent = removeQueue.text;
    refs.queue.dataset.action = removeQueue.act;
  }
}
