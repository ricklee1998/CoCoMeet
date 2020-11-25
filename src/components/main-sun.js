import React, { Component } from 'react';
import ColorTools from './tools/ColorTools';
import TextTools from './tools/TextTools';
import Tools from './tools/Tools';
import BoardInternal from './board/BoardInternal';
import EditableText from './board/EditableText';
import ChatView from './chat/ChatView_sun';
import Channel from './chat/Channel';
import Name from './chat/Name';
import HeaderBar from './header/header-bar-sun';
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { getFlatDataFromTree, getTreeFromFlatData } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import io from 'socket.io-client';

const socket = io('http://localhost:4002/board_server');

const test_tree0 = {treenum: 2, treeId: 0, tree: 
          [{id: '1', title: 'tree1 N1', parent: 'NULL', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '2', title: 'tree1 N2', parent: 'NULL', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '3', title: 'tree1 N3', parent: '2', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '4', title: 'tree1 N4', parent: '2', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '5', title: 'tree1 N5', parent: '4', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '6', title: 'tree1 N6', parent: '4', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '7', title: 'tree1 N7', parent: '2', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '8', title: 'tree1 N8', parent: 'NULL', color: 'cyan', weight: 'bold', deco: 'underline'},
          ]
};
const test_tree1 = {treenum: 2, treeId: 1, tree:
          [{id: '9', title: 'tree2 N9', parent: 'NULL', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '10', title: 'tree2 N10', parent: 'NULL', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '11', title: 'tree2 N11', parent: '10', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '12', title: 'tree2 N12', parent: '12', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '13', title: 'tree2 N13', parent: '12', color: 'cyan', weight: 'bold', deco: 'underline'},
            {id: '14', title: 'tree2 N14', parent: '10', color: 'cyan', weight: 'bold', deco: 'underline'},
        ]
};


class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel:'cocomeet', uname:'Yonsei', connected:'False', msg_to_block:'Select Message!',
      treenum: 2,
      lefttree: {treeID: 0, treeData: {title: "dummy"}},
      righttree: {treeID: 1, treeData: {title: "dummy"}},
      //tree1: 0,
      //tree2: 1,
      getcolor: "cyan",
      LeftcheckedList: [],
      RightcheckedList: [],
      lastMoveNodeLeft: "NULL",
      lastMoveNodeRight: "NULL",
    };
    this.onDropLeft = this.onDropLeft.bind(this);
    this.onDropRight = this.onDropRight.bind(this);
    this.updateNodeLeft = this.updateNodeLeft.bind(this);
    this.updateNodeRight = this.updateNodeRight.bind(this);
    this.updateTreeLeft = this.updateTreeLeft.bind(this);
    this.updateTreeRight = this.updateTreeRight.bind(this);
    this.LeftmovedNodeIs = this.LeftmovedNodeIs.bind(this);
    //this.RightmovedNodeIs = this.RightmovedNodeIs.bind(this);
    this.movedNodeIs = this.movedNodeIs.bind(this);
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.updateName = this.updateName.bind(this);
    this.updateChannel = this.updateChannel.bind(this);
    this.updateConnected = this.updateConnected.bind(this);
    this.updateMsgToBlock = this.updateMsgToBlock.bind(this);
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.toFlatDataFrom = this.toFlatDataFrom.bind(this);
    this.toTreeDataFrom = this.toTreeDataFrom.bind(this);
    this.recieve_sendtree = this.recieve_sendtree.bind(this);
    this.getAttrToBoard = this.getAttrToBoard.bind(this);
    this.getListFromBoard = this.getListFromBoard.bind(this);
  }
  toTreeDataFrom=(flat)=>{
    return getTreeFromFlatData({
      flatData: flat.map(node => ({ ...node, 
        title: <EditableText node_id={node.id} initialValue={node.title}/>, color: node.color, weight: node.weight, deco: node.deco })),
      getKey: node => node.id,
      getParentKey: node => node.parent, 
      rootKey: 'NULL', 
    });
  }
  toFlatDataFrom=(tree)=>{
    return getFlatDataFromTree({
      treeData: tree,
      getNodeKey: ({ node }) => node.id, 
      ignoreCollapsed: false, 
    }).map(({ node, path }) => ({
      id: node.id,

      // The last entry in the path is this node's key
      // The second to last entry (accessed here) is the parent node's key
      parent: path.length > 1 ? path[path.length - 2] : 'NULL',
    }));

  }
  componentDidMount(){
    // 방 들어왔을 때 실행되는 코드
    // channel uname ... 설정하는 코드

    // tree data 받기
    console.log("did moumt start");
    const dataL = test_tree0;
    const dataR = test_tree1;
    this.recieve_sendtree('L', dataL);
    this.recieve_sendtree('R', dataR);
    
    socket.on('addTree', function(data){
      this.setState({treenum: data.treenum})
    })
    socket.on('sendTree', function(data){
      //move, migrate, sunsapple, delete, addnode
      const treeID = data.treeId;
      if(treeID === this.lefttree.treeID){
        this.recieve_sendtree('L', data);
      }else if(treeID === this.righttree.treeID){
        this.recieve_sendtree('R', data);
      }
    })
    socket.on('sendNode', function(data){
      //changetext, changeattr
    })
  }
  recieve_sendtree = (tree_leftright, data) =>{
    const treeID = data.treeId;
    if(tree_leftright==='L'){
      const left_tree = this.toTreeDataFrom(data.tree);
      if(data.treenum === null){
        this.setState({lefttree: {treeID: treeID, treeData: left_tree}});
      }else{
        this.setState({treenum: data.treenum, lefttree: {treeID: treeID, treeData: left_tree}});
      }
    }else if(tree_leftright==='R'){
      const right_tree = this.toTreeDataFrom(data.tree);
      if(data.treenum === null){
        this.setState({righttree: {treeID: treeID, treeData: right_tree}});
      }else{
        this.setState({treenum: data.treenum, righttree: {treeID: treeID, treeData: right_tree}});
      }
    }
  }
  addTree =()=>{
    socket.emit('addTree')
  }
  LeftmovedNodeIs = (node) =>{
    this.setState({lastMoveNodeLeft: node})
    // emit_func('l', node)

  }
  movedNodeIs = (node, tree_id) =>{
    if (tree_id === this.state.lefttree.treeID){
      this.setState({lastMoveNodeLeft: node})
    }
    else {
      this.setState({lastMoveNodeRight: node})
    }
    // if(sunapple){
    //   emit
    //   NULL
    // }else if(delete){
    //   NULL
    // }else{
    //   left right 비교를
    //   if(LEFT right 다를 때 ){
    //     MIgrate
    //   }else{
    //     move
    //   }
    // }
    //migrate
  }
  //emit_func=(tree id, node)=>{
    //leftmovednodeid === rightmovednodeid
    //  migrate
    //  ...
    //socket.emit('sunsApple', flatdata);
    //socket.emit('deleteNode', flatdata);
    //socket.emit('migrateNode', twoflatdata);
    //socket.emit('moveNode', flatdata)
  //}
  updateTreeLeft = (treeData, tree_id) => {
    const tree = this.toFlatDataFrom(treeData);
    console.log(tree);
    //delete,sunsapple,changetext, changeattr, move, migrate
    //socket.emit('changeText', flatdata1row);
    //socket.emit('changeAttribute', flatdata1row);

  }
  updateTreeRight = (treeData, tree_id) =>{
    
  }
  updateNodeLeft = () => {
    // addblock
    // left tree 마지막에 "block with id -1" 추가
    var addnode_lefttree = this.state.lefttree.treeData;
    addnode_lefttree.concat(
      [{ id: -1, title: "dummy", color: "cyan", weight: "normal", deco: "none"}]
    )
    socket.emit("addNode", this.toFlatDataFrom(addnode_lefttree));
  }
  updateNodeRight = () => {
    // addblock
    // left tree 마지막에 "block with id -1" 추가
    var addnode_righttree = this.state.righttree.treeData;
    addnode_righttree.concat(
      [{ id: -1, title: "dummy", color: "cyan", weight: "normal", deco: "none"}]
    )
    socket.emit("addNode", this.toFlatDataFrom(addnode_righttree));
  }
  onDropLeft = (tree_id) => {
    if (tree_id !== this.state.lefttree.treeID) {
      socket.emit('changeTree', tree_id);
      socket.on('changeTree',function(data){
        this.recieve_sendtree('L', data);
      })
    }
  }
  onDropRight = (tree_id) => {
    if (tree_id !== this.state.righttree.treeID) {
      socket.emit('changeTree', tree_id);
      socket.on('changeTree',function(data){
        this.recieve_sendtree('R', data);
      })
    }
  }
  getAttrToBoard = (get_attr, msg) => {
    //data = {tree_id_list: {1: [1,3,4], 3:[6,2,5,7]}, color: "cyan"}
    var attr = {};
    var checkedList = {};
    checkedList[this.state.lefttree.treeID]=this.state.LeftcheckedList;
    checkedList[this.state.righttree.treeID]=this.state.RightcheckedList;
    attr["tree_id_list"]=checkedList;
    if (msg==='c'){
      //this.setState({get_color: get_attr});
      attr["color"]=get_attr;
    } else if (msg==='d') {
      //this.setState({get_deco: get_attr});
      attr["deco"]=get_attr;
    } else if (msg ==='w') {
      //this.setState({get_weight: get_attr});
      attr["weight"]=get_attr;
    }
    console.log(attr);
    socket.emit('changeAttribute',);
  }
  getListFromBoard = (tree_id, node_id, isChecked) => {
    var left_test_checked = this.state.LeftcheckedList;
    var right_test_checked = this.state.RightcheckedList;
    if(tree_id === this.state.lefttree.treeID){
      if(isChecked !== false){
        this.setState({LeftcheckedList: left_test_checked.concat(node_id)});
      }else{
        this.setState({LeftcheckedList: left_test_checked.filter(targetValue => targetValue !==node_id)});
      }
    }else if(tree_id === this.state.righttree.treeID){
      if(isChecked !== false){
        this.setState({RightcheckedList: right_test_checked.concat(node_id)});
      }else{
        this.setState({RightcheckedList: right_test_checked.filter(targetValue => targetValue !==node_id)});
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  updateName(uname){
    this.setState({uname: uname});
  }
  updateChannel(channel){
    this.setState({channel: channel});
  }
  updateConnected(value){
    this.setState({connected:value});
  }
  updateMsgToBlock(msg_to_block){
    this.setState({msg_to_block: msg_to_block});
  }
  render() {
    return (
      <div>
        <HeaderBar />
        <div class="h-full">
          <DndProvider backend={HTML5Backend}>
            <div >
                <div class="flex m-4 ">
                    <div class="w-1/9 p-3">
                        <div class="h-quaterscreen">
                            <div class="mb-6 pb-3 shadow-md bg-gray-100 h-1/5">
                              <div class="border-b-2 border-gray-300 bg-gray-200 h-12 p-3 mb-3">
                                <div class="font-sans text-lg font-semibold text-teal-500">Channel</div>
                              </div>
                              <Name uname = {this.state.uname} onUpdate_name2={this.updateName} />
                              <Channel channel={this.state.channel} connected={this.state.connected} onUpdate_channel2={this.updateChannel} onUpdate_connect2={this.updateConnected} /> 
                            </div>
                            <div class="mb-6 pb-3 shadow-md bg-gray-100 h-1/5">
                              <div class="border-b-2 border-gray-300 bg-gray-200 h-12 p-3 mb-3">
                                <div class="font-sans text-lg font-semibold text-teal-500">Block Colors</div>
                              </div>
                              <ColorTools sendColor={this.getAttrToBoard}/>
                            </div>
                            <div class="mb-6 pb-3 shadow-md bg-gray-100 h-1/5">
                              <div class="border-b-2 border-gray-300 bg-gray-200 h-12 p-3 mb-3">
                                <div class="font-sans text-lg font-semibold text-teal-500">Font Style</div>
                              </div>
                              <TextTools sendDeWe={this.getAttrToBoard}/>
                            </div>
                            <div class="mb-6 pb-3 shadow-md bg-gray-100 h-1/5">
                              <div class="border-b-2 border-gray-300 bg-gray-200 h-12 p-3 mb-3">
                                <div class="font-sans text-lg font-semibold text-teal-500">Tree Lists</div>
                              </div>
                              <div class="ml-3">
                                <button class="bg-transparent border-transparent text-blue-500 font-extrabold hover:underline py-2" onClick={this.addTree} >Add New Tree</button>
                                <div class="pl-2">
                                  <Tools treenum={this.state.treenum} tree1={this.state.lefttree.treeID} tree2={this.state.righttree.treeID}/>
                                  
                                </div>
                              </div>
                            </div>
                        </div>
                    </div>
                    <div class="w-3/9 p-3">
                        <div class="shadow-md bg-gray-100 h-quaterscreen">
                          <div class="border-b-2 border-gray-300 bg-gray-200 h-12 p-3 mb-3">
                            <div class="font-sans text-lg font-semibold text-teal-500">Left Tree</div>
                          </div>
                          <BoardInternal tree={this.state.lefttree} sendChecked={this.getListFromBoard} movedNodeIs={this.movedNodeIs}
                          onDrop={this.onDropLeft} updateNode={this.updateNodeLeft} updateTree={this.updateTreeLeft}/>
                        </div>
                    </div>
                    <div class="w-3/9 p-3">
                        <div class="shadow-md bg-gray-100 h-quaterscreen">
                          <div class="border-b-2 border-gray-300 bg-gray-200 h-12 p-3 mb-3">
                            <div class="font-sans text-lg font-semibold text-teal-500">Right Tree</div>
                          </div>
                          <BoardInternal tree={this.state.righttree} sendChecked={this.getListFromBoard} movedNodeIs={this.movedNodeIs}
                          onDrop={this.onDropRight} updateNode={this.updateNodeRight} updateTree={this.updateTreeRight}/>
                        </div>
                    </div>
                    <div class="w-2/9 p-3">
                        <div class="shadow-md bg-gray-100 h-quaterscreen">
                          <div class="border-b-2 border-gray-300 bg-gray-200 h-12 p-3 mb-3">
                            <div class="font-sans text-lg font-semibold text-teal-500">Chat</div>
                          </div>
                          <ChatView uname = {this.state.uname} channel={this.state.channel} connected={this.state.connected} OnupdateMsgToBlock={this.updateMsgToBlock}/> 
                        </div>
                    </div>
                </div>
            </div>
          </DndProvider>
        </div>
      </div>
    );
  }
}

export default Main;