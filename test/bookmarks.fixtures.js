function makeBookmarksArray () {
  return [
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
}

module.exports = {makeBookmarksArray}