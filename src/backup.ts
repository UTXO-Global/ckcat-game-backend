// ===================== =====================
// async claimPurchaseDailyTask(userId: string) {
//     try {
//         const profile = await this.getProfile(userId)
//         if (!profile) throw Errors.InvalidAccount
//         if (!profile.purchaseClaimTime) {
//             if (!profile.purchaseDailyTaskTime) {
//                 const endPurchaseDaily =
//                     profile.purchaseDailyTaskTime.setHours(23, 59, 59, 999)
//                 const endPurchaseClaim = profile.purchaseClaimTime.setHours(
//                     23,
//                     59,
//                     59,
//                     999
//                 )
//                 const now = getNowUtc()
//                 if (
//                     endPurchaseDaily == endPurchaseClaim ||
//                     endPurchaseDaily < now.getTime()
//                 ) {
//                     return {
//                         status: false,
//                         purchaseDailyTaskTime:
//                             profile.purchaseDailyTaskTime,
//                         purchaseClaimTime: profile.purchaseClaimTime,
//                     }
//                 }

//                 const allowClaim = endPurchaseDaily > now.getTime()
//                 if (!allowClaim) {
//                     return {
//                         status: false,
//                         purchaseDailyTaskTime:
//                             profile.purchaseDailyTaskTime,
//                         purchaseClaimTime: profile.purchaseClaimTime,
//                     }
//                 }
//             }
//             profile.purchaseClaimTime = getNowUtc()
//             await startTransaction(async (manager) => {
//                 await BigMoneyProfile.updateProfile(profile, manager)
//             })
//             return {
//                 status: true,
//                 purchaseDailyTaskTime: profile.purchaseDailyTaskTime,
//                 purchaseClaimTime: profile.purchaseClaimTime,
//             }
//         }
//         return {
//             status: false,
//             purchaseDailyTaskTime: profile.purchaseDailyTaskTime,
//             purchaseClaimTime: profile.purchaseClaimTime,
//         }
//     } catch (error) {
//         throw error
//     }
// }
// ===================== =====================

// ===================== =====================
// async claimPurchaseDailyTask(
//     req: AuthRequest,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const { user } = req
//         res.send(
//             new ResponseWrapper(
//                 await this.bigMoneyProfileService.claimPurchaseDailyTask(
//                     user.id
//                 )
//             )
//         )
//     } catch (err) {
//         next(err)
//     }
// }
// ===================== =====================

// ===================== =====================
// this.router.get(
//     '/claim-purchase-daily-task',
//     this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
//     this.bigMoneyProfileController.claimPurchaseDailyTask.bind(
//         this.bigMoneyProfileController
//     )
// )
// ===================== =====================
