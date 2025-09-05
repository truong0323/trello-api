
//param socket sẽ được lấy từ thư viện socket.io
export const inviteUserToBoardSocket = (socket) => {
     socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
      //cách làm nhanh và đơn giản nhất : Emit ngược lại một sự kiện về cho mọi client khác(ngoại trừ chính cái thằng gửi request lên ) rồi ở phía FE check
      socket.broadcast.emit('BE_USER_INVITED_TO_BOARD',invitation)

    })
}