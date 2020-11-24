import asset_storage from 'ic:canisters/asset_storage';
import React, { useState } from 'react';
import { render } from 'react-dom';
import ReactDOM from 'react-dom';
import { Link, HashRouter, Route, Switch, useHistory } from 'react-router-dom';
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
        this.props.history.push('/image/' + ret);
    }

    onVideoNameChange(ev) {
        this.setState({ ...this.state, videoName: ev.target.value });
    }

    onChangeHandler(event) {
        // console.log(ev.target.files[0])
        // this.setState({ ...this.state, video: ev.target.files[0] });
        console.log(this.state.video)
        if (event.target.files && event.target.files[0]) {
            this.setState({ fileName: event.target.files[0].name });
            let reader = new FileReader();
            reader.onload = (e) => {
                // console.log(e.target.result);
                this.setState({ video: e.target.result });
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    render() {
        window.asset_storage = asset_storage;
        return (
            <section className="section">
                <div>
                    <h1>Please upload your image below</h1>
                </div>
                <div className="uploadArea">
                    <div>
                        <div class="col-md-6">
                            <div class="field">
                                <div class="control">
                                    <label class="label">Video Info</label>
                                    <input class="input" type="text" placeholder="Video Title" id="videoInfo" onChange={ev => this.onVideoNameChange(ev)} />
                                </div>
                            </div>
                            <label class="label">Upload Your File </label>
                            <div id="file-js-example" class="file has-name">
                                <label class="file-label">
                                    <input class="file-input" type="file" name="resume" onChange={ev => this.onChangeHandler(ev)} />
                                    <span class="file-cta">
                                        <span class="file-icon">
                                            <i class="fas fa-upload"></i>
                                        </span>
                                        <span class="file-label">
                                            Choose a file…
                                        </span>
                                    </span>
                                    <span class="file-name">
                                        {this.state.fileName === "" ? " No File Uploaded" : this.state.fileName}
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
            </section>
        );
    }
}

class Card extends React.Component {
    render() {
        return (
            <Link to={`/image/${this.props.video.video_id}`}>
                <div class="card">
                    <div class="card-image">
                        <figure class="image is-4by3">
                            <img src={this.props.video.file} />
                        </figure>
                    </div>
                    <div class="card-content">
                        <div class="content">
                            {this.props.video.title}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            all: [],
            connections: [],
        };
    }

    componentDidMount() {
        asset_storage.all().then(videos => this.setState({ ...this.state, all: videos }));
        asset_storage.connections_vids().then(videos => this.setState({ ...this.state, connections: videos }));
    }

    onNameChange(ev) {
        this.setState({ ...this.state, videoID: ev.target.value });
    }

    render() {
        const all = this.state.all.map(video => (
            <div className="column is-2"><Card video={video}/></div>
        ));
        const connections = this.state.connections.map(video => (
            <div className="column is-2"><Card video={video}/></div>
        ));
        return (
            <div className="app">
                <section class="section">
                    <h1 class="title">Greetings, from BABMEO! Loading videos</h1>
                    <h2 className="subtitle">All videos</h2>
                    <div className="columns">
                        {all}
                    </div>
                    <h2 className="subtitle">Videos from your LinkedUp connections</h2>
                    <div className="columns">
                        {connections}
                    </div>
                </section>
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
        const videos = await asset_storage.search(this.props.match.params.name);
        console.log('searching', videos)
        this.setState({ ...this.state, searchResults: videos, searching: false })
    }

    render() {
        return (
            <section className="section">
                <h1 class="title">Search results</h1>
                { this.state.searching ? (
                    <progress class="progress is-small is-primary" max="100">Loading...</progress>
                ) : (
                        this.state.searchResults == null ? "" : (
                            (this.state.searchResults.length ? <div>
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
        this.setState({
            ...this.state,
            views: Number(video.views),
            likes: Number(video.likes),
            videoName: video.title,
            video: video.file
        });
        console.log(this.state);
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
        history.push('/search/' + term);
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
