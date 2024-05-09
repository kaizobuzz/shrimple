package database

const (
    UserTableName string="users"
    UserFieldId string="id"
    UserFieldUsername string="username"
    UserFieldPasswordHash string="password_hash"
    UserFieldExperience string="experience"
    UserFieldFriends string="friends"
    UserFieldIncomingFriendRequests string="incoming_friend_requests"
    UserFieldOutgoingFriendRequests string="outgoing_friend_requests"
    UserFieldGuessHistory string="guess_history"
    FriendTableName string="friends"
    FriendFieldId1 string="id_1"
    FriendFieldId2 string="id_2"
    FriendRequestTableName string="friend_requests"
    FriendRequestFieldSendingId string="sending_id"
    FriendRequestFieldReceivingId string="receiving_id"
)
