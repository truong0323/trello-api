import { invitationModel } from '~/models/invitationModel'

import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { pickUser } from '~/utils/formatters'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'

const createNewBoardInvitation = async (reqBody , inviterId) => {
    try {
        //Người đi mời :  chính là người đang request , nên chúng ta tìm theo id lấy từ token
        const inviter = await userModel.findOneById(inviterId)
        //Người được mời : lấy theo email nhận từ phía BE
        const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
        //Tìm luôn cái Board ra để lấy data xử lí
        const board = await boardModel.findOneById(reqBody.boardId)

        //Nếu không tồn tại 1 trong 3 thằng thì cứ thẳng tay reject
        if( !invitee || !inviter || ! board) {
            throw new ApiError(StatusCodes.NOT_FOUND , 'Inviter, Invitee or Board not found!!!')

        }

        //Tạo data cần thiết để lưu vào DB

        //Có thể thử bỏ hoặc làm sai lệch type , boardInvitation , status để xem Model validat ok chưa
        const newInvitationData = {
            inviterId,
            inviteeId: invitee._id.toString(),
            type: INVITATION_TYPES.BOARD_INVITATION,
            boardInvitation: {
                boardId: board._id.toString(),
                status: BOARD_INVITATION_STATUS.PENDING //Mặc định ban đầu trạng thái sẽ là Pending
            }
        }

        //Gọi sang Model để lưu vào DB
        const createdInvitation  = await invitationModel.createNewBoardInvitation(newInvitationData)
        const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

        //Ngoài thông tin của cái board invitation  mới tạo thì trả về đủ cả luôn board ,inviter,invitee cho FE thoải mái xử lí
        const resInvitation = {
            ...getInvitation,
            board,
            inviter: pickUser(inviter),
            invitee: pickUser(invitee)
        }
        return resInvitation

    } catch (error) {
        throw error
    }
}
const getInvitations = async (userId) => {
    try {
        const getInvitations = await invitationModel.findByUser(userId)
        // console.log(getInvitations)
        // vì xác dữ liệu inviter,invitee và board đang ở giá trị mảng 1 phần tử nếu lấy ra được nên chúng ta 
        //biến đổi nó về json Object trước khi trả về cho FE
        const resInvitations = getInvitations.map(i => {
            return {
                ...i,
                inviter: i.inviter[0] || {},
                invitee: i.invitee[0] || {},
                board: i.board[0] || {}

            }
        })
        return resInvitations
    } catch (error) {
        throw error
    }
}
const updateBoardInvitation = async (userId , invitationId, status) => {
    try {
        //tìm bản ghi invitation trong model
        const getInvitation = await invitationModel.findOneById(invitationId)
        if(!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Lời mời không được tìm thấy')
        
        //sau khi có invitation rồi thì lấy full thông tin của board
        const boardId = getInvitation.boardInvitation.boardId
        const getBoard = await boardModel.findOneById(boardId)
        if(!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

            // kiểm tra xem nếy status là ACCEPTED join board mà cái thằng user(invitee) đã là owner hoặc member của board
            // rồi thì trả về thông báo lỗi luôn
            //Note: 2 mảng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId nên cho nó về String hết luôn để check
        const boardOwnerAndMemberIds = [...getBoard.ownerIds,...getBoard.memberIds].toString()
        if(status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Bạn đã là thành viên của Board này rồi!!!')
        }
        //Tạo dữ liệu để update bản ghi Invatation
        const updateData = {
            boardInvitation: {
                ...getInvitation.boardInvitation,
                status: status // status là ACCEPTED hoặc REJECTED do FE gửi lên
            }
        }
        // bươcs 1 cập nhật status trong bản ghi invitation
        const updatedInvitation = await invitationModel.update(invitationId, updateData)
        // bước 2: Nếu trường hợp Accept một lời mời thành công , thì cần phải thêm thông tin của thằng user (userId) vào bản ghi memberIds trong collection board
        
        if(updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
            await boardModel.pushMemberIds(boardId , userId)
        }
        // console.log('updatedInvitation:',updatedInvitation);
        return updatedInvitation

    } catch (error) {
        throw error
    }

}
export const invitationService = {
    createNewBoardInvitation,
    getInvitations,
    updateBoardInvitation
}