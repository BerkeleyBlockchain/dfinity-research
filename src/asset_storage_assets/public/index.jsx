import asset_storage from 'ic:canisters/asset_storage';
import React, { useState } from 'react';
import { render } from 'react-dom';
// import React, { Comonent } from 'react';
import ReactDOM from 'react-dom';
import { Link, HashRouter, Route, Switch, useHistory } from 'react-router-dom';
// import "./style.css"
import "./style.scss";

class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoID: 'Video ID',
            message: '',
            videoName: '',
            video: [],
            fileName: '',
        };
    }

    // Should call asset_storage.store, provide video title and file (string)
    async storeVideo() {
        console.log(this.state.videoName)
        // console.log(this.state.video)
        const ret = await asset_storage.store(this.state.videoName, this.state.video);
        console.log(ret)
    }

    onVideoNameChange(ev) {
        this.setState({ ...this.state, videoName: ev.target.value });
    }

    onChangeHandler(event) {
        // console.log(ev.target.files[0])
        // this.setState({ ...this.state, video: ev.target.files[0] });
        console.log(this.state.video)
        if (event.target.files && event.target.files[0]) {
            this.setState({ fileName: ev.target.files[0].name });
            let reader = new FileReader();
            reader.onload = (e) => {
                // console.log(e.target.result);
                this.setState({ video: e.target.result });
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    render() {
        return (
            <div className="app">
                <div>
                    <h1>Please upload your image below</h1>
                </div>
                <div className="uploadArea">
                    <div>
                        
                        {/* <input id="videoName" value={this.state.videoName} onChange={ev => this.onVideoNameChange(ev)}></input> */}
                        {/* <input id="videoInfo" value={this.state.videoInfo} onChange={ev => this.onVideoInfoChange(ev)}></input> */}


                        {/* <div class="col-md-6">
                            <form method="post" action="#" id="#">
                                <div class="form-group files">
                                    <label>Upload Your File </label>
                                    <input type="file" class="form-control" multiple="" onChange={ev => this.onChangeHandler(ev)} />
                                </div>
                            </form>
                        </div> */}


                        <div class="col-md-6">
                            <div class="field">
                                <div class="control">
                                    <label class="label">Video Info</label>
                                    <input class="input" type="text" placeholder="Video Title" id="videoInfo" onChange={ev => this.onVideoNameChange(ev)}/>
                                </div>
                            </div>
                            <label class="label">Upload Your File </label>
                            <div id="file-js-example" class="file has-name">
                                <label class="file-label">
                                    <input class="file-input" type="file" name="resume" onChange={ev => this.onChangeHandler(ev)}/>
                                    <span class="file-cta">
                                        <span class="file-icon">
                                            <i class="fas fa-upload"></i>
                                        </span>
                                        <span class="file-label">
                                            Choose a file…
                                        </span>
                                    </span>
                                    <span class="file-name">
                                        {this.state.fileName === "" ?  " No File Uploaded" : this.state.fileName}
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <Link to="/">
                                <button class="button" onClick={() => this.storeVideo()}>Upload video!</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Card extends React.Component {
    render() {
        return (
            
            <div>
                <div>
                    {this.props.value}
                </div>

                <Link to={`/image/${this.props.id}`}>
                    <img src={this.props.img}/>
                </Link>

            </div>

        );
    }
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoID: '',
            message: '',
            videoName: '',
            search: '',
            // videoInfo: '',
            video: [],
            searchResults: null,
            searching: false,
            all: [],
        };
    }

    async componentDidMount() {
        const videos = await asset_storage.all();
        console.log(videos)
        this.setState({ ...this.state, all: videos });
    }

    async getVideo() {
        const video = await asset_storage.retrieve(this.state.videoID);
        console.log('getting video')
        this.setState({ ...this.state, message: video['file'] });
    }

    async searchVideo() {
        this.setState({ ...this.state, searching: true });
        const videos = await asset_storage.search(this.state.search);
        console.log('searching', videos)
        this.setState({ ...this.state, searchResults: videos, searching: false })
    }

    onNameChange(ev) {
        this.setState({ ...this.state, videoID: ev.target.value });
    }

    onSearchChange(ev) {
        this.setState({ ...this.state, search: ev.target.value });
    }

    render() {
        var elements = [];
        for (var i = 0; i < this.state.all.length; i++) {
            // push the component to elements!
            elements.push(<Card id={this.state.all[i]["video_id"]} value={this.state.all[i]["title"]} img={this.state.all[i]["file"]} />);
        }
        return (
            <div className="app">
                <section class="section">
                    <div>
                        <h1 class="title">Greetings, from BABMEO! Loading videos</h1>
                    </div>
                </section>
                <div>
                    {elements}
                </div>
            </div>
        );
    }
}

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchResults: null,
            searching: false,
        };
    }

    async componentDidMount() {
        this.setState({ ...this.state, searching: true });
        const videos = await asset_storage.search(this.props.params.name);
        console.log('searching', videos)
        this.setState({ ...this.state, searchResults: videos, searching: false })
    }

    render() {
        return (
            <section className="section">
                <div>
                    <h1>Search results</h1>
                </div>
                { this.state.searching ? <div>Searching...</div> : (
                    this.state.searchResults == null ? "" : (
                        (this.state.searchResults.length ? <div>
                            <h2>Search results</h2>
                            {this.state.searchResults.map(v => <pre>{JSON.stringify(v)}</pre>)}
                        </div> : <div>No results matched your query.</div>)))
                }
            </section>
        );
    }
}


class Video extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoName: '',
            video: '',
            views: 0,
            likes: 0
        };
    }

    async componentDidMount() {
        const video = await asset_storage.retrieve(this.props.match.params.id);
        console.log('getting video')
        this.setState({ ...this.state, views: video['views'], likes: video['likes'], videoName: video['title'], video: video['file'] });
    }

    onNameChange(ev) {
        this.setState({ ...this.state, videoID: ev.target.value });
    }

    render() {
        return (
            <div className="app">
                <div>
                    <h1>{this.state.videoName}</h1>
                </div>
                <div><img src={this.state.video} /></div>
                <div>
                    <p>Likes {this.state.likes}</p>
                    <p>Views {this.state.views}</p>
                </div>
            </div>
        );
    }
}
       

function Navbar() {
    const [term, updateTerm] = useState('');
    const history = useHistory();
    const search = (evt) => {
        evt.preventDefault();
        history.push('/search/'  + term);
    }
    return (
        <nav class="navbar is-warning" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <Link className="navbar-item has-text-weight-semibold is-size-5" to="/">
                    BABMEO
                </Link>
            </div>

            <div class="navbar-start">
                <Link className="navbar-item" to="/">Home</Link>
                <Link className="navbar-item" to="/upload">Upload Image</Link>
            </div>

            <form class="navbar-end" onSubmit={search}>
                <div class="field has-addons is-align-self-center mr-2">
                    <div class="control">
                        <input class="input" type="text" value={term} placeholder="Search by title"
                            onChange={e => updateTerm(e.target.value)} /> 
                    </div>
                    <div class="control">
                            <button type="submit" class="button is-light">
                                Search
                            </button>
                    </div>
                </div>
            </form>
            {/* <Link to="/image/">Upload Image </Link> */}
        </nav>
    );
};

function App() {
    return (
        <main>
            <Navbar />
            <Switch>
                <Route path="/" component={Home} exact />
                <Route path="/upload" component={Upload} />
                <Route path="/image/:id" component={Video} />
                <Route path="/search/:name" component={Search} />
            </Switch>
        </main>
    )
}

render(
    <HashRouter>
        <App />
    </HashRouter>,
    document.getElementById('app')
)


// render(<MyHello />, document.getElementById('app'));

// class MyHello extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             videoID: 'Video ID',
//             message: '',
//             videoName: '',
//             // videoInfo: '',
//             video: [],
//         };
//     }

//     async whoami() {
//         const greeting = await asset_storage.whoami();
//         alert(greeting);
//     }

//     // Should call asset_storage.store, provide video title and file (string)
//     async storeVideo() {
//         console.log(this.state.videoName)
//         // console.log(this.state.video)
//         const ret = await asset_storage.store(this.state.videoName, this.state.video);
//         console.log(ret)
//     }

//     async getVideo() {
//         const video = await asset_storage.retrieve(this.state.videoID);
//         // console.log(video)
//         // console.log(video['file'])
//         console.log('getting video')
//         this.setState({ ...this.state, message: video['file'] });
//         // this.setState({ ...this.state, message: video });
//     }

//     onNameChange(ev) {
//         this.setState({ ...this.state, videoID: ev.target.value });
//     }

//     onVideoNameChange(ev) {
//         this.setState({ ...this.state, videoName: ev.target.value });
//     }

//     onChangeHandler(event) {
//         // console.log(ev.target.files[0])
//         // this.setState({ ...this.state, video: ev.target.files[0] });
//         // console.log(this.state.video)
//         if (event.target.files && event.target.files[0]) {
//             let reader = new FileReader();
//             reader.onload = (e) => {
//                 // console.log(e.target.result);
//                 this.setState({ video: e.target.result });
//             };
//             reader.readAsDataURL(event.target.files[0]);
//         }
//     }



//     render() {
//         return (
//             <div className="app">
//                 <div>
//                     <h1>Greetings, from BABTUBE!</h1>
//                     <p> Type your video id in the Video input field, then click <b> Get Video</b> to display the desired video.</p>
//                 </div>
//                 <div className="uploadArea">
//                     <div>

//                         <input id="videoName" value={this.state.videoName} onChange={ev => this.onVideoNameChange(ev)}></input>
//                         {/* <input id="videoInfo" value={this.state.videoInfo} onChange={ev => this.onVideoInfoChange(ev)}></input> */}


//                         <div class="col-md-6">
//                             <form method="post" action="#" id="#">
//                                 <div class="form-group files">
//                                     <label>Upload Your File </label>
//                                     <input type="file" class="form-control" multiple="" onChange={ev => this.onChangeHandler(ev)} />
//                                 </div>
//                             </form>
//                         </div>


//                         <button onClick={() => this.storeVideo()}>Upload video!</button>
//                     </div>
//                     <input id="videoID" value={this.state.videoID} onChange={ev => this.onNameChange(ev)}></input>
//                     <button onClick={() => this.getVideo()}>Get Video!</button>
//                     <button onClick={() => this.whoami()}>Who am I?</button>
//                 </div>
//                 <div>Video is: "<img id="target" src={this.state.message} />"</div>
//             </div>
//         );
//     }
// }