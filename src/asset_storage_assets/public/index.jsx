import asset_storage from 'ic:canisters/asset_storage';
import bigMap from 'ic:canisters/bigmap';
import React, { useState } from 'react';
import { render } from 'react-dom';
import ReactDOM from 'react-dom';
import { Link, HashRouter, Route, Switch, useHistory } from 'react-router-dom';
import "./style.scss";
import { thumbnail, uploadChunks } from './chunk';
import BigSearch from 'ic:canisters/BigSearch';


const OPTIONS = ["All Videos", "Friend's Videos"]
const CheckBox = props => {
    return (
        <li>
            <input key={props.id} onChange={props.handleCheckChieldElement} type="checkbox" checked={props.isChecked} value={props.value} /> {props.value}
        </li>
    )
}

function randomDelay(id, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(id), Math.random() * 2000 + 500);
    });
}

class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            videoName: '',
            video: '',
            fileName: '',
            tags: [
                { id: 1, value: "funny", isChecked: false },
                { id: 2, value: "gaming", isChecked: false },
                { id: 3, value: "dark", isChecked: false },
                { id: 4, value: "animals", isChecked: false }
            ],
            uploadProgress: "",
        };
    }

    componentDidMount() {
        console.log("mounting")
    }

    // Should call asset_storage.store, provide video title and file (string)
    async storeVideo() {
        let ls = []
        console.log("should be empty", ls)
        let tags = this.state.tags
        var i;
        for (i = 0; i < tags.length; i++) {
            if (tags[i].isChecked) {
                ls.push(tags[i].value)
            }
        }
        console.log("tags", ls)
        console.log(this.state.videoName);
        let thumb = "";
        if (this.state.video.startsWith('data:video')) {
            thumb = await thumbnail(this.state.video);
        }
        // console.log(this.state.video)

        // BIGMAP UPLOADING
        const id = [];
        let idstr = '';
        for (let i = 0; i < 32; i++) {
            let val = Math.floor(Math.random() * 10)
            id.push(val);
            idstr += val;
        };

        const dataByteArray = [];
        const data = JSON.stringify({
            title: this.state.videoName,
            file: this.state.video,
            thumbnail: thumb,
            tags: ls
        });
        for (let i = 0; i < data.length; i++) {
            dataByteArray.push(data.charCodeAt(i))
        }

        const ret = await bigMap.put(id, dataByteArray);

        // Just chunking stuff we aren't using anymore
        // const { chunks, uploaders } = await uploadChunks(this.state.video, randomDelay)
        // this.setState({ uploadProgress: `Uploading ${JSON.stringify(chunks)}...\n` });
        // await Promise.all(uploaders.map(u => u.then(
        //     (id) => this.setState({ uploadProgress: this.state.uploadProgress + id + ' finished uploading\n' })
        // )));
        console.log({ thumb })

        // Upload with assset_storage canister
        await asset_storage.store(id, ls);
        console.log(ret);
        window.bigMap = bigMap;
        console.log(id, idstr, dataByteArray);
        this.props.history.push('/image/' + idstr);
    }

    onVideoNameChange(ev) {
        this.setState({ ...this.state, videoName: ev.target.value });
    }

    handleCheckChieldElement = (event) => {
        let tags = this.state.tags
        tags.forEach(t => {
            if (t.value === event.target.value)
                t.isChecked = event.target.checked
        })
        this.setState({ tags: tags })
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
                console.log(thumbnail(e.target.result))
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
                <div className="col-md-6">
                    <div className="field">
                        <div className="control">
                            <label className="label">Video Info</label>
                            <input className="input" type="text" placeholder="Video Title" id="videoInfo" onChange={ev => this.onVideoNameChange(ev)} />
                        </div>
                    </div>
                    <label className="label">Upload Your File </label>
                    <div id="file-js-example" className="file has-name">
                        <label className="file-label">
                            <input className="file-input" type="file" name="resume" onChange={ev => this.onChangeHandler(ev)} />
                            <span className="file-cta">
                                <span className="file-icon">
                                    <i className="fas fa-upload"></i>
                                </span>
                                <span className="file-label">
                                    Choose a file…
                                </span>
                            </span>
                            <span className="file-name">
                                {this.state.fileName === "" ? " No File Uploaded" : this.state.fileName}
                            </span>
                        </label>
                    </div>
                    <pre>{this.state.uploadProgress}</pre>
                </div>

                <ul>
                    {
                        this.state.tags.map((t, index) => {
                            return (<CheckBox key={index} handleCheckChieldElement={this.handleCheckChieldElement}  {...t} />)
                        })
                    }
                </ul>

                <button className="button" onClick={() => this.storeVideo()}>Upload video!</button>
            </section>
        );
    }
}

class Card extends React.Component {
    render() {
        return (
            <Link to={`/image/${this.props.video.video_id}`}>
                <div className="card">
                    <div className="card-image">
                        <figure className="image is-4by3">
                            <img src={this.props.video.thumbnail || this.props.video.file} />
                        </figure>
                    </div>
                    <div className="content">

                        <p className="title is-4">{this.props.video.title}</p>
                        {(this.props.from != null)
                            ? <p className="subtitle is-8">Recommended from {this.props.from} Videos</p>
                            : <p className="subtitle is-8">Recommended from public</p>}
                    </div>
                </div>
            </Link >
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
            tags: [
                { id: 1, value: "All Videos", isChecked: true },
                { id: 2, value: "Friend's Videos", isChecked: true }
            ]
        };
    }
    handleCheckChieldElement = (event) => {
        let tags = this.state.tags
        tags.forEach(t => {
            if (t.value === event.target.value)
                t.isChecked = event.target.checked
        })
        this.setState({ tags: tags })
    }

    async decode(videoIDs) {
        var vids = []
        console.log(videoIDs)
        for(let i = 0; i < videoIDs.length; i++) {
            let id = videoIDs[i]
            let encVideo = await bigMap.get(id)
            if (encVideo.length == 0) {
                console.warn('Video id ' + id + ' is missing');
                continue;
            }
            let dataStr = "";
            for(let j = 0; j < encVideo[0].length; j++) {
                dataStr += String.fromCharCode(encVideo[0][j]) 
            }
            vids.push(JSON.parse(dataStr))
        }
        return vids;
    }

    async componentDidMount() {
        var videoIDs = await bigMap.list([])
        var vids = await this.decode(videoIDs);
        this.setState({ ...this.state, all: vids})
        var connectionVids = await asset_storage.connections_vids();
        console.log('connection ids', connectionVids.map(m => m.video_id));
        var connectionDecoded = await this.decode(connectionVids.map(m => m.video_id))
        console.log('decoded connection vids', connectionDecoded)
        this.setState({ ...this.state, connections: connectionDecoded });
    }

    render() {
        const all = this.state.all.map(video => (
            <div key={video.title} className="column is-2"><Card video={video} /></div>
        ));
        const connections = this.state.connections.map(video => (
            <div key={video.title} className="column is-2"><Card video={video} from={"Connections"} /></div>
        ));
        return (
            <div className="app">
                <section className="section">
                    <h1 className="title">Greetings, from BABMEO! Loading videos</h1>
                    {this.state.tags.map((t, index) => {
                        return (<CheckBox key={index} handleCheckChieldElement={this.handleCheckChieldElement}  {...t} />)
                    })}

                    {this.state.tags[0].isChecked && (
                        <div>
                            <h2 className="subtitle">All videos</h2>
                            <div className="columns">
                                {all}
                            </div>
                        </div>
                    )}
                    {this.state.tags[1].isChecked && (
                        <div>
                            <h2 className="subtitle">Videos from your LinkedUp connections</h2>
                            <div className="columns">
                                {connections}
                            </div>
                        </div>
                    )}
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

    async componentDidUpdate(prevProps) {
        if (prevProps.match.params.name !== this.props.match.params.name)
            await this.componentDidMount()
    }

    render() {
        return (
            <section className="section">
                <h1 className="title">Search results</h1>
                {this.state.searching ? (
                    <progress className="progress is-small is-primary" max="100">Loading...</progress>
                ) : (
                        this.state.searchResults == null ? "" : (
                            (this.state.searchResults.length ? <div>
                                {this.state.searchResults.map(video => (<div className="column is-2"><Card video={video} /></div>))}
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
            name: '',
            file: '',
            views: 0,
            likes: 0
        };
    }

    async componentDidMount() {
        const idstr = this.props.match.params.id;
        const id = [];
        for (let i = 0; i < idstr.length; i++) {
            id.push(Number(idstr.charAt(i)));
        };
        const video = await bigMap.get(id);
        console.log(id, video);
        let data = '';
        for (let i = 0; i < video[0].length; i++) {
            data += String.fromCharCode(video[0][i]);
        }
        this.setState(JSON.parse(data));
    }

    async likeVideo(event) {
        await asset_storage.likeVideo(this.state.video_id);
        // window.location.reload(false);
    }

    async subVideo(event) {
        await asset_storage.subscribe(this.state.creator);
        // window.locaftion.reload(false);
    }

    render() {
        return (
            <div className="app">
                <div>
                    <h1 className="title">{this.state.title}</h1>
                </div>
                <div>{this.state.file.startsWith('data:video') ?
                    <video controls src={this.state.file} /> :
                    <img src={this.state.file} />}
                </div>
                <div>
                    <button className="button is-link is-outlined" onClick={() => this.likeVideo()}>👍</button>
                    <button className="button is-link is-outlined" onClick={() => this.subVideo()}>subscribe</button>
                    <p><b>Likes</b> {this.state.likes.length}</p>
                    <p><b>Views</b> {+this.state.views}</p>
                    <p><b>Tags</b> {this.state.tags ? this.state.tags.join(',') : 'no tags'}</p>
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
        <nav className="navbar is-warning" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <Link className="navbar-item has-text-weight-semibold is-size-5" to="/">
                    BABMEO
                </Link>
            </div>

            <div className="navbar-start">
                <Link className="navbar-item" to="/">Home</Link>
                <Link className="navbar-item" to="/upload">Upload Image</Link>
            </div>

            <form className="navbar-end" onSubmit={search}>
                <div className="field has-addons is-align-self-center mr-2">
                    <div className="control">
                        <input className="input" type="text" value={term} placeholder="Search by title"
                            onChange={e => updateTerm(e.target.value)} />
                    </div>
                    <div className="control">
                        <button type="submit" className="button is-light">
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
            <section>
                <center>
                    Visit <a href="/proxy/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai">LinkedUp</a>.
                </center>
            </section>
        </main>
    )
}

render(
    <HashRouter>
        <App />
    </HashRouter>,
    document.getElementById('app')
)
