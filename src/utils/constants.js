/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
export const WHITELIST_DOMAINS = [
    // 'http://localhost:5173'
    //vd:75 khoong cần loclahost nũa vì trong config/cors đã luôn luôn cho phép mooi trường:
    //env.BUILD_MODE === 'dev' 

]
export const BOARD_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private'
}
export const  DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12 

export const INVITATION_TYPES = {
    BOARD_INVITATION: 'BOARD_INVITATION'
}
export const BOARD_INVITATION_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED:  'ACCEPTED',
    REJECTED: 'REJECTED'
}