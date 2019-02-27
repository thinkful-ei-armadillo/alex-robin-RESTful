const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const BookmarksService = require('../src/bookmarks/bookmarks-service');

describe('Bookmark Endpoints', () => {
  let db;
  let testBookmarks = [
    {
      id: 1,
      title: 'Bookmark 1',
      url: 'https://bookmark1.com',
      description: 'This is Bookmark 1',
      rating: 1
    },
    {
      id: 2,
      title: 'Bookmark 2',
      url: 'https://bookmark2.com',
      description: 'This is Bookmark 2',
      rating: 2
    },
    {
      id: 3,
      title: 'Bookmark 3',
      url: 'https://bookmark3.com',
      description: 'This is Bookmark 3',
      rating: 3
    }
  ];

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.DB_URL_TEST
    });
  });
  before(() => db('bookmarks').truncate());
  afterEach(() => db('bookmarks').truncate());
  after(() => db.destroy());

  context(`Given 'bookmarks' has data`, () => {
    beforeEach(() => {
      return db.into('bookmarks').insert(testBookmarks);
    });
    it(`'getAllBookmarks()' resolves all bookmarks from 'bookmarks' table`, () => {
      return BookmarksService.getAllBookmarks(db).then(actual => {
        expect(actual).to.eql(testBookmarks);
      });
    });
    it(`'getBookmarkById()' resolves an article by ID from 'bookmarks' table`, () => {
      const id = 3;
      const testBookmark = testBookmarks[id-1];
      return BookmarksService.getBoomarkById(db, id).then(actual => {
        expect(actual).to.eql(testBookmark);
      });
    });
    it(`'updateBookmark()' resolves with an updated article by ID from 'bookmarks' table`, () => {
      const id = 3;
      const originalBookmark = testBookmarks[id-1];
      const newBookmarkFields = {
        title: 'Updated Title'
      };
      return BookmarksService.updateBookmark(db, id, newBookmarkFields).then(actual => {
        expect(actual).to.eql({
          ...originalBookmark,
          ...newBookmarkFields
        });
      });
    });
  });
});