const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const bodyParser = express.json();
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();

function sanitizeBookmark(bookmark) {
  const sanitizedBookmark = {
    id: bookmark.id,
    title: xss(bookmark.title), //sanititze title
    url: xss(bookmark.url), //sanitize url
    rating: bookmark.rating
  };
  if (bookmark.description) {
    sanitizedBookmark.description = xss(bookmark.description); //sanitize description
  }
  return sanitizedBookmark;
}

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
      .then(bookmarks => {
        return res.json(bookmarks.map(bookmark => sanitizeBookmark(bookmark)))
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    let { title, url, description, rating } = req.body;
    let newBookmark = { title, url, rating };

    for(const [key, value] of Object.entries(newBookmark)) {
      if (!value) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    if (!isURL(url)) {
      logger.error('Invalid url');
      return res.status(400).json({error: { message: `URL in request body is not a valid URL` }});
    }
    
    if (description) {
      newBookmark = {...newBookmark, description};
    }

    BookmarksService.insertBookmark(knexInstance, newBookmark)
      .then(bookmark => {
        logger.info(`Created bookmark with id ${bookmark.id}.`);
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(sanitizeBookmark(bookmark));
      })
      .catch(next);
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
          return res.status(404).json({error: { message: `Bookmark with id ${bookmarkId} not found` }});
        }
        res.json(sanitizeBookmark(bookmark));
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const newBookmarkFields = req.body;
    const { bookmarkId } = req.params;
    BookmarksService.updateBookmark(knexInstance, bookmarkId, newBookmarkFields)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmarkId} not found.`);
          return res.status(404).json({error: { message: `Bookmark with id ${bookmarkId} not found` }});
        }
        logger.info(`Bookmark with id ${bookmarkId} updated.`);
        res.json(sanitizeBookmark(bookmark));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { bookmarkId } = req.params;
    BookmarksService.deleteBookmark(knexInstance, bookmarkId)
      .then((bookmark) => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmarkId} not found.`);
          return res.status(404).json({error: { message: `Bookmark with id ${bookmarkId} not found` }});
        }
        logger.info(`Bookmark with id ${bookmarkId} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarksRouter;
