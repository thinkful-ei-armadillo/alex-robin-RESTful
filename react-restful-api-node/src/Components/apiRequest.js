import React from 'react';

export default function fetchRequest (){
return fetch('https://localhost:8000/api/bookmarks')
.then(res=> res.json())
.then(resJ => console.log(resJ))
 
}