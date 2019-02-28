import React, { Component } from 'react'


export default class editBookmark extends Component{
handleOnSubmit= (e) =>{
    e.preventDefaul();
}

    render(){
        return (
            <form on onSubmit={(e)=> this.handleOnSubmit}>
                <label htmlFor="title">Title:</label>
                <input id="title"></input>
                <label htmlFor="url">Url:</label>
                <input id="url"></input>
                <label htmlFor="Description">Desc:</label>
                <input id="Description"></input>
                <label htmlFor="rating">Rating:</label>
                <select id="rating">
                    <option value='null'>0</option>
                    <option value='1' >1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                </select>
                <input type="submit" id='submit' value="submit"/>
            </form>
        )
    }
}