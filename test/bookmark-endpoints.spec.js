const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const BookmarksService = require('../src/bookmarks/bookmarks-service');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('Bookmark Endpoints', () => {
  let db;
  let testBookmarks = makeBookmarksArray();

  before('establish connection to database',() => {
    // db = knex({
    //   client: 'pg',
    //   connection: {
    //     host: '127.0.0.1',
    //     user: 'dunder_mifflin',
    //     password: process.env.MIGRATION_DB_PASS,
    //     database: 'bookmark_test'
    //   }
    // });
    db = knex({
      client: 'pg',
      connection: process.env.DB_URL_TEST
    });
    app.set('db', db);
  });
  before('clean the table',() => db('bookmarks').truncate());
  afterEach('maid service', () => db('bookmarks').truncate());
  after('end connection', () => db.destroy());

  context(`Given 'bookmarks' has data`, () => {
    beforeEach(() => {
      return db.into('bookmarks').insert(testBookmarks);
    });
    it(`'getAllBookmarks()' resolves all bookmarks from 'bookmarks' table`, () => {
      // return BookmarksService.getAllBookmarks(db).then(actual => {
      //   expect(actual).to.eql(testBookmarks);
      // });
      return supertest(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testBookmarks)
    });
    it(`'getBookmarkById()' resolves an article by ID from 'bookmarks' table`, () => {
      const id = 3;
      const testBookmark = testBookmarks[id-1];
      return supertest(app)
        .get(`/api/bookmarks/${id}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testBookmark);
    });
    describe.only('/api/bookmarks/:bookmarkId PATCH request tests', () => {
      it(`'updateBookmark()' resolves with an updated article with partial info from 'bookmarks' table`, () => {
        const id = 3;
        const originalBookmark = testBookmarks[id-1];
        const newBookmarkFields = {
          title: 'Updated Title'
        };
        return supertest(app)
          .patch(`/api/bookmarks/${id}`)
          .send(newBookmarkFields)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, {...originalBookmark, ...newBookmarkFields});
      });
      it(`should return a 400 if no updated fields are provided`, () => {
        return supertest(app)
          .patch('/api/bookmarks/3')
          .send({})
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400, {error: { message: 'No updated fields were found to update from'}})
      });
    });
    it(`'deleteBookmark' resolves with a deleted article by ID from 'bookmarks' table`, () => {
      const id = 1;
      const updatedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== id);
      return supertest(app)
        .delete(`/api/bookmarks/${id}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(204);
    });
  });
  context('given bookmarks has no data', () => {
    it(`'getAllBookmarks' resolves an empty array from 'bookmarks' table`, () => {
      // return BookmarksService.getAllBookmarks(db)
      //   .then((actual) => {expect(actual).to.eql([])});
      return supertest(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, []);
    });
    describe('POST /articles', () => {
      it(`'insertBookmark' resolves with a new bookmark`, () => {
        const newBookmark = testBookmarks[0];
        return supertest(app)
          .post(`/api/bookmarks`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(newBookmark)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(newBookmark.title);
            expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
          });
      });
      const keys = ['title', 'url', 'rating'];
      keys.forEach(key => {
        const newBookmark = {
          title: 'test bookmark',
          id: 2,
          url: 'https://bookmark2.com',
          description: 'This is Bookmark 2',
          rating: 2 
        }
        it(`responds with 400 and an error message when the '${key}' is missing`, () => {
          delete newBookmark[key];
          console.log(key);
          return supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .send(newBookmark)
            .expect(400, {error: { message: `Missing '${key}' in request body`}});
        });
      });
    })
    it(`'findBookmarkById' resolves with a 404 given an invalid id` , () => {
      return supertest(app)
        .get('/api/bookmarks/5')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(404, {error: { message: `Bookmark with id 5 not found`}});
    });
  });

  
  context(`Given an XSS attack on bookmark`, () => {
    const maliciousBookmark = {
      id: 911,
      title: 'Bad <script>alert("xss");</script>',
      url: 'https://www.maliciouswebsiteattackfromhackerman.com<script>alert("xss");</script>',
      description: 'hi <script>alert("xss");</script>',
      rating: 5,
    };
    it(`removes XSS attack content when POSTing`, () => {
      return supertest(app)
        .post(`/api/bookmarks`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(maliciousBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql('Bad &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
          expect(res.body.url).to.eql('https://www.maliciouswebsiteattackfromhackerman.com&lt;script&gt;alert(\"xss\");&lt;/script&gt;');
          expect(res.body.description).to.eql('hi &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
        });
    });
    describe('general XSS attack tests:', () => {
      beforeEach('insert malicious bookmark', () => {
        return db
          .into('bookmarks')
          .insert([ maliciousBookmark ]);
      });
      it(`removes XSS attack content on 'getBookmarkById()'`, () => {
        return supertest(app)
          .get(`/api/bookmarks/${maliciousBookmark.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql('Bad &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
            expect(res.body.url).to.eql('https://www.maliciouswebsiteattackfromhackerman.com&lt;script&gt;alert(\"xss\");&lt;/script&gt;');
            expect(res.body.description).to.eql('hi &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
          });
      });
      it(`removes XSS attack content on 'getBookmarks()'`, () => {
        return supertest(app)
          .get(`/api/bookmarks`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(resp => {
            const res = resp.body[0];
            expect(res.title).to.eql('Bad &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
            expect(res.url).to.eql('https://www.maliciouswebsiteattackfromhackerman.com&lt;script&gt;alert(\"xss\");&lt;/script&gt;');
            expect(res.description).to.eql('hi &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
          });
      });
    });
  });
});