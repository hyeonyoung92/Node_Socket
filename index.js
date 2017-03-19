/**
 * Created by Admin on 2017-03-17.
 */
var express = require('express');
var http = require('http').Server(express()); // http를 express로 띠움
var fs = require('fs');
var socketio = require('socket.io');
// var app = express();
// var http = require('http').Server(app);
// var socketio = require('socket.io')(http);


// express를 쓰면 아래 코드가 필요 없음.
var server = http.createServer(function(request, response) {
   fs.readFile('client.html', 'utf-8', function(error, data) {
      response.writeHead(200, {'Content-Type' : 'text/html'});
      response.end(data);
   });
});

server.listen(3000, function() {
   console.log('Server running at http://localhost:3000');
});

var roomName = 'client'; // 방 이름
var users = {}; // 현재 접속한 사람의 간단한 정보
users.connectedUsers = [];


//Socket Server 실행
var io  = socketio.listen(server);
//클라이언트가 소켓 서버로 접속했을 때 실행
io.sockets.on('connection', function(socket) {
  // console.log(socket);

    // 사용자가 대화방에 접속함.
    socket.on('join', function(name) {
       users.connectedUsers.push({ 'name' : name, 'id' : socket.id });
       socket.emit("view_member", users.connectedUsers);

       io.sockets.in(roomName).emit('replace_member', { 'name' : name, 'id' : socket.id });

       socket.join(roomName);
    });

    // 사용자가 다른 사용자에게 메시지를 전달함.
    socket.on('sendTo', function(data) {
       io.sockets.in(roomName).sockets[data.to].emit('receive', data.message);
    });
});