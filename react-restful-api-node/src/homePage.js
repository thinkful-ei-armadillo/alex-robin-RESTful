import React,{Component} from 'react';
import apiRequest from './Component/apiRequest';
export default class HomePage extends Component{
    getAPI= ()=>{
        return apiRequest();
    }
    render(){
        return (
            <p>{this.getAPI}</p>
        )
    }
}