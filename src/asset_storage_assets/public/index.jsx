import asset_storage from 'ic:canisters/asset_storage';
import * as React from 'react';
import { render } from 'react-dom';

class MyHello extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Name',
            message: '',
        };
    }

    async whoami() {
        const greeting = await asset_storage.whoami();
        alert(greeting);
    }

    async doGreet() {
        const greeting = await asset_storage.whoami();
        this.setState({ ...this.state, message: greeting });
    }

    onNameChange(ev) {
        this.setState({ ...this.state, name: ev.target.value });
    }

    render() {
        return (
            <div style={{ "font-size": "30px" }}>
                <div style={{ "background-color": "yellow" }}>
                    <p>Greetings, from DFINITY!</p>
                    <p> Type your message in the Name input field, then click <b> Get Greeting</b> to display the result.</p>
                </div>
                <div style={{ "margin": "30px" }}>
                    <input id="name" value={this.state.name} onChange={ev => this.onNameChange(ev)}></input>
                    <button onClick={() => this.whoami()}>Who am I?</button>
                    <button onClick={() => this.doGreet()}>Get Greeting!</button>
                </div>
                <div>Greeting is: "<span style={{ "color": "blue" }}>{this.state.message}</span>"</div>
            </div>
        );
    }
}

render(<MyHello />, document.getElementById('app'));