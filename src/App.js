import React from 'react';
import logo from './logo.svg';
import './App.css';


import ReactDOM from 'react-dom';
import axios from 'axios';

const { Component } = React;
const { render } = ReactDOM;
var searchquery="";
var updated=false;
const LOAD_STATE = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  LOADING: 'LOADING'
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      favs:[],
      photos: [],
      totalPhotos: 0,
      perPage: 5,
      currentPage: 1,
      loadState: LOAD_STATE.LOADING
    }
    
  }

  changelike = (imgkey) =>{
    var ar=this.state.favs
    
    
    if(ar.indexOf(imgkey)=== -1)
    {
      this.setState({
      favs: [...this.state.favs, imgkey]
      })
    console.log("  Liked ",typeof(imgkey))
    console.log(this.state.favs)
    return true
    }
    else{
      
      var index = ar.indexOf(imgkey);
      if (index !== -1) ar.splice(index, 1);
      this.setState({
        favs: ar
      })
      console.log("notliked")
      console.log(this.state.favs)
      return false;
    } 
  }

  isfav = (imgkey) =>{
    console.log("is fav ")
    var ar=this.state.favs
    console.log(ar)
    if(ar == null)
    {
      console.log("unlike style null array")
      return false
      
    }
    if(ar.indexOf(imgkey)=== -1)
    {
      console.log("likee style defalut")
     return false;
      
    }
    else{
      console.log("unlike style ")
      return true;
    }
  }

  componentDidMount() {
    this.fetchPhotos(this.state.currentPage);
  }
  
  fetchPhotos(page) {
    var self = this;
    
    const { perPage } = this.state;
    var { appId, baseUrl } = this.props;
    const options = {
      params: {
        client_id: appId,
        page: page,
        per_page: perPage,
        query: searchquery,
        isliked:[0,0,0,0,0]
      }
    };
    
    this.setState({ loadState: LOAD_STATE.LOADING });
    
    if(updated==true){
      baseUrl="https://api.unsplash.com/search/photos/"
    }
    
    axios.get(baseUrl, options)
      .then((response) => {
      if(baseUrl == "https://api.unsplash.com/search/photos/"){
        self.setState({
          photos: response.data.results,
          totalPhotos: parseInt(response.headers['x-total']),
          currentPage: page,
          loadState: LOAD_STATE.SUCCESS
        });
      }
      else{
        self.setState({
          photos: response.data,
          totalPhotos: parseInt(response.headers['x-total']),
          currentPage: page,
          loadState: LOAD_STATE.SUCCESS
        });
      }
        
      })
      .catch(() => {
        this.setState({ loadState: LOAD_STATE.ERROR });
      });
  }
  
  submitSearch = () => {
    
    searchquery=document.getElementById("box").value;
    if(searchquery){updated=true;}
    else{updated=false;}
    this.fetchPhotos(1);
   
  }
  
  render() {
    return (

      <div className="app">
              <div className="search">
                
        <input type="text" id="box"/>
                <input type="button" defaultValue="search" id="clickbox" onClick={this.submitSearch}/>
        </div>
        <Pagination
          current={this.state.currentPage}
          total={this.state.totalPhotos} 
          perPage={this.state.perPage} 
          onPageChanged={this.fetchPhotos.bind(this)}
          
        />
        {this.state.loadState === LOAD_STATE.LOADING
            ? <div className="loader"></div>
            : <List data={this.state.photos}
            changelike={this.changelike}
            isfav={this.isfav}
            />  
          }
        
      </div>
    )
  }
}

class ListItem extends Component {
  togglelike = () =>{
    
    var val=this.props.changelike(this.props.photo.id)
    console.log(val)
   
  }


  checkstyle = (imgkey) =>{
    var v=this.props.isfav(imgkey)
    console.log(v)
    return v
  }

  render(){
    const likestyle = {
      color : "red",
      
    };
    const unlikestyle = {
      color :"rgb(136, 136, 136)"
    };
    

  return (
    <div key={this.props.photo.id} className="grid__item card">
      <div className="card__body">
        <img src={this.props.photo.urls.small} alt="" />
      </div>
      <div className="card__footer media">
        <img src={this.props.photo.user.profile_image.small} alt="" className="media__obj" />
        <div className="media__body">
          <a href={this.props.photo.user.portfolio_url} target="_blank">{ this.props.photo.user.name }</a>
          <i class="fa fa-heart" aria-hidden="true" onClick={this.togglelike} style={this.checkstyle(this.props.photo.id)? likestyle:unlikestyle}></i> 
        </div>
        
      </div>
    </div>
  )
}
}

const List = ({ data,changelike,isfav}) => {

  var items = data.map(photo => <ListItem key={photo.id} photo={photo} changelike={changelike} isfav={isfav}/>);
  return (
    <div className="grid">
      { items }
    </div>
  )
}

class Pagination extends Component {  
  pages() {
    var pages = [];
    for(var i = this.rangeStart(); i <= this.rangeEnd(); i++) {
      pages.push(i)
    };
    return pages;
  }

  rangeStart() {
    var start = this.props.current - this.props.pageRange;
    return (start > 0) ? start : 1
  }

  rangeEnd() {
    var end = this.props.current + this.props.pageRange;
    var totalPages = this.totalPages();
    return (end < totalPages) ? end : totalPages;
  }

  totalPages() {
    return Math.ceil(this.props.total / this.props.perPage);
  }

  nextPage() {
    return this.props.current + 1;
  }

  prevPage() {
    return this.props.current - 1;
  }
  
  hasFirst() {
    return this.rangeStart() !== 1
  }

  hasLast() {
    return this.rangeEnd() < this.totalPages();
  }

  hasPrev() {
    return this.props.current > 1;
  }

  hasNext() {
    return this.props.current < this.totalPages();
  }

  changePage(page) {
    this.props.onPageChanged(page);
  }

  render() {
    return (
      <div className="pagination">
       
        <div className="pagination__left">
          <a href="#" className={!this.hasPrev() ? 'hidden': ''}
            onClick={e => this.changePage(this.prevPage())}
          >Prev</a>
        </div>

        <div className="pagination__mid">
          <ul>
            <li className={!this.hasFirst() ? 'hidden' : ''}>
              <a href="#" onClick={e => this.changePage(1)}>1</a>
            </li>
            <li className={!this.hasFirst() ? 'hidden' : ''}>...</li>
            {
              this.pages().map((page, index) => {
                return (
                  <li key={index}>
                    <a href="#"
                      onClick={e => this.changePage(page)}
                      className={ this.props.current == page ? 'current' : '' }
                    >{ page }</a>
                  </li>
                );
              })
            }
            <li className={!this.hasLast() ? 'hidden' : ''}>...</li>
            <li className={!this.hasLast() ? 'hidden' : ''}>
              <a href="#" onClick={e => this.changePage(this.totalPages())}>{ this.totalPages() }</a>
            </li>
          </ul>
        </div>

        <div className="pagination__right">
          <a href="#" className={!this.hasNext() ? 'hidden' : ''}
            onClick={e => this.changePage(this.nextPage())}
          >Next</a>
        </div>
      </div>
    );    
  }
};

Pagination.defaultProps = {
  pageRange: 2
}



render(
  <App   
    appId={"a179a3f7d129de729d23f0d248f4242b3964976ca5939b74498ab12e77fcc5c5"}
    baseUrl={"https://api.unsplash.com/photos/curated/"}
  />,
  document.getElementById('mount-point')
);





export default App;