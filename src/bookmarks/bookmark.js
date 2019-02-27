const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const STORE = require('../STORE');
const bodyParser = express.json();
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();

function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => res.json(bookmarks))
      .catch(next);
  })
  .post(bodyParser, (req, res) => {
    let { title, url, description, rating } = req.body;

    if (!title) {
      logger.error('title is required');
      return res.status(400).send('title is required.');
    }
    if (!url) {
      logger.error('url is required');
      return res.status(400).send('url is required.');
    }
    if (rating && isNaN(parseInt(rating))) {
      logger.error('Invalid rating');
      return res.status(400).send('Invalid rating.');
    }
    if (!isURL(url)) {
      logger.error('Invalid url');
      return res.status(400).send('Invalid url.');
    }

    description = description || '';
    rating = parseInt(rating) || 0;
    const bookmark = { id: uuid(), title, url, description, rating };

    STORE.push(bookmark);
    logger.info(`Created bookmark with id ${bookmark.id}.`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route('/bookmarks/:bookmarkId')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { bookmarkId } = req.params;

    BookmarksService.getBoomarkById(knexInstance, bookmarkId)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmarkId} not found.`);
          return res.status(404).send('Bookmark not found.');
        }
        res.json(bookmark);
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { bookmarkId } = req.params;
    BookmarksService.deleteBookmark(knexInstance, bookmarkId)
      .then(bookmark => {
        if (!bookmarkId) {
          logger.error(`Bookmark with id ${bookmarkId} not found.`);
          return res.status(404).send('Bookmark not found.');
        }
        logger.info(`Bookmark with id ${bookmarkId} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarksRouter;
