const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks');
  },
  getBoomarkById(knex, id) {
    return knex.from('bookmarks').select('*').where('id' , id).first();
  },
  insertBookmart(knex, newBookmark) {
    return knex.insert(newBookmark).into('bookmarks').returning('*').then(rows => rows[0]);
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks').where('id', id).delete();
  },
  updateBookmark(knex, id, newBookmarkFields){
    return knex('bookmarks').where('id', id).update(newBookmarkFields);
  }
};

module.exports = BookmarksService;