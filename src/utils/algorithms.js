/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
//tính toán giá trị skip phục vụ cho tác vụ phân trang
export const pagingSkipValue = (page , itemsPerPage) => {
    //luôn luôn đảm bảo nếu giá trị không hợp lêk thì  thì return về 0 hết
    if(!page || !itemsPerPage) return 0
    if(page <= 0|| itemsPerPage <=0) return 0


    return (page-1)* itemsPerPage
}