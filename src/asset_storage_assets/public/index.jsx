import asset_storage from 'ic:canisters/asset_storage';
import * as React from 'react';
import { render } from 'react-dom';
// import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link, BrowserRouter, Route, Switch } from 'react-router-dom';
import "./style.css"


class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoID: 'Video ID',
            message: '',
            videoName: '',
            video: [],
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
        // console.log(this.state.video)
        if (event.target.files && event.target.files[0]) {
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

                        <input id="videoName" value={this.state.videoName} onChange={ev => this.onVideoNameChange(ev)}></input>
                        {/* <input id="videoInfo" value={this.state.videoInfo} onChange={ev => this.onVideoInfoChange(ev)}></input> */}


                        <div class="col-md-6">
                            <form method="post" action="#" id="#">
                                <div class="form-group files">
                                    <label>Upload Your File </label>
                                    <input type="file" class="form-control" multiple="" onChange={ev => this.onChangeHandler(ev)} />
                                </div>
                            </form>
                        </div>

                        <div>
                            <Link to="/">
                                <button onClick={() => this.storeVideo()}>Upload video!</button>
                            </Link>
                        </div>
                    </div>
                </div>
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
            // videoInfo: '',
            video: [],
        };
    }

    async getVideo() {
        const video = await asset_storage.retrieve(this.state.videoID);
        console.log('getting video')
        this.setState({ ...this.state, message: video['file'] });
    }

    onNameChange(ev) {
        this.setState({ ...this.state, videoID: ev.target.value });
    }

    render() {
        return (
            <div className="app">
                <div>
                    <h1>Greetings, from BABTUBE!</h1>
                    <p> Search your image id to find it!</p>
                </div>
                <div>
                    <input placeholder="Type id of image" id="videoID" value={this.state.videoID} onChange={ev => this.onNameChange(ev)}></input>
                    <button onClick={() => this.getVideo()}>Get Video!</button>
                </div>
                <div><img id="target" src={this.state.message} /></div>
            </div>
        );
    }
}

class Image extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoID: '',
            message: '',
            videoName: '',
            // videoInfo: '',
            video: [],
        };
    }

    async getVideo() {
        const video = await asset_storage.retrieve(this.state.videoID);
        console.log('getting video')
        this.setState({ ...this.state, message: video['file'] });
    }

    onNameChange(ev) {
        this.setState({ ...this.state, videoID: ev.target.value });
    }

    render() {
        return (
            <div className="app">
                <div>
                    <h1>Greetings, from BABTUBE!</h1>
                    <p> Search your image id to find it!</p>
                </div>
                <div>
                    <input placeholder="Type id of image" id="videoID" value={this.state.videoID} onChange={ev => this.onNameChange(ev)}></input>
                    <button onClick={() => this.getVideo()}>Get Video!</button>
                </div>
                <div><img id="target" src={this.state.message} /></div>
            </div>
        );
    }
}
       
       


class Test extends React.Component {
    render() {
        return (
            <h1>YOYO</h1>
        );
    }

}

function Navbar() {
    return (
      <div>
        <Link to="/">Babtube </Link>
        <Link to="/upload">Upload Image </Link>
      </div>
    );
  };

function App() {
    return (
        <main>
            <Navbar />
            <Switch>
                <Route path="/" component={Home} exact />
                <Route path="/upload" component={Upload} />
                <Route path="/image/:id" component={Image} />
            </Switch>
        </main>
    )
}

render(
    <BrowserRouter>
        <App />
    </BrowserRouter>, 
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