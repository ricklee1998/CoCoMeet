import React, { Component } from 'react';
import ColorTools from './tools/ColorTools';
import Board from './board/Board';
import BoardExternal from './board/BoardExternal';
//import BoardInternal from './board/BoardInternal';
import MenuBar from "./menu/menu-bar-sun";
import ChatView from './chat/ChatView';
import Channel from './chat/Channel';
import Name from './chat/Name';
import HeaderBar from './header/header-bar-sun';
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {channel:'cocomeet', uname:'Yonsei', connected:'False', msg_to_block:'Empty Block'};
    this.updateName = this.updateName.bind(this);
    this.updateChannel = this.updateChannel.bind(this);
    this.updateConnected = this.updateConnected.bind(this);
    this.update_msg_to_block = this.update_msg_to_block.bind(this);
  }
  updateName(uname){
    this.setState({uname: uname});
  }
  updateChannel(channel){
    this.setState({channel: channel});
  }
  updateConnected(value){
    this.setState({connected:value});
  }
  update_msg_to_block(msg_to_block){
    alert('ok');
    this.setState({msg_to_block: msg_to_block});
  }
  render() {
    //alert('main');
    return (
      <div>
        <HeaderBar />
        <MenuBar />
        <SplitterLayout primaryIndex={1} secondaryInitialSize={200}>
          <div>
            <h2><Name uname = {this.state.uname} onUpdate_name2={this.updateName} /></h2>
            <h3><Channel channel={this.state.channel} connected={this.state.connected} onUpdate_channel2={this.updateChannel} onUpdate_connect2={this.updateConnected} /> </h3>
            <ColorTools/>
          </div>
          <SplitterLayout secondaryInitialSize={350}>
            <SplitterLayout percentage='true'><BoardExternal /></SplitterLayout>
            <ChatView uname = {this.state.uname} channel={this.state.channel} connected={this.state.connected} onUpdate_msg_to_block={this.update_msg_to_block}/>
          </SplitterLayout>
        </SplitterLayout>
      </div>
    );
  }
}

export default Main;