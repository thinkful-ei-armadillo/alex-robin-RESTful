import React, { Component } from 'react';
import HomePage from './homePage';
import {Route} from 'react-router-dom';
import editBookmark from './editbookmark';
import updateBookmark from './updateBookmark';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Route path="/" Component={HomePage}/>
        <Route
          path='/edit-bookmark'
          component={editBookmark}
        />
        {/* <Route path="/bookmark/:bookmarkID" Component={}/> */}
        <Route path="/update-bookmark/:bookmarkID" Component={updateBookmark}/>
      </div>
    );
  }
}

export default App;
