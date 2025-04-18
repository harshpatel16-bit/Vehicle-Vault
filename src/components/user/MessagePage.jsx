import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import defaultAvatar from "../image/usericon.jpg";
import chatImage from "../image/chatdefault.png"

export const MessagePage = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("id");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverDetails, setReceiverDetails] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);

  // ✅ Fetch chat users for sidebar
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await axios.get("/message/chats/"+currentUserId);
        setChatUsers(res.data.data);
      } catch (err) {
        console.error("Error fetching chat users:", err);
      }
    };
    if (currentUserId) fetchChatUsers();
  }, [currentUserId]);

  // ✅ Fetch receiver's details
  useEffect(() => {
    const fetchReceiver = async () => {
      try {
        const res = await axios.get("/user/"+receiverId);
        setReceiverDetails(res.data.data);
      } catch (err) {
        console.error("Error fetching receiver details:", err);
      }
    };
    if (receiverId) fetchReceiver();
  }, [receiverId]);

  // ✅ Fetch messages between current user and receiver
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("/message/message/"+currentUserId+"/"+receiverId);
        setMessages(res.data);

        // ✅ Mark messages as read
        await axios.post("/message/read", {
          senderId: receiverId,
          receiverId: currentUserId,
        });
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    if (currentUserId && receiverId) fetchMessages();
  }, [currentUserId, receiverId]);
  console.log("Sending message from:", currentUserId, "to:", receiverId);

  // ✅ Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post("http://localhost:3011/message/send", {
        senderId: currentUserId,
        receiverId,
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="container-fluid mt-3">
      <div className="row border rounded" style={{ height: "85vh" }}>
        {/* Sidebar */}
        <div className="col-md-3 border-end p-3 overflow-auto">
          <h6 className="mb-3">Chats</h6>
          {chatUsers.map((user) => (
            <div
              key={user._id}
              className={`d-flex align-items-center mb-2 p-2 rounded ${
                user._id === receiverId ? "bg-light" : "hover-bg"
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/usersidebar/message/${user._id}`)}
            >
              <img
                src={user.profilePic || defaultAvatar}
                alt="user"
                className="rounded-circle me-2"
                style={{ width: "35px", height: "35px" }}
              />
              <span>{user.userName}</span>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="col-md-9 d-flex flex-column justify-content-between">
          {/* Header */}
          <div className="border-bottom p-3 bg-light d-flex align-items-center">
            {receiverDetails ? (
              <>
                <img
                  src={receiverDetails.profilePic || defaultAvatar}
                  alt="profile"
                  className="rounded-circle me-2"
                  style={{ width: "40px", height: "40px" }}
                />
                <strong>{receiverDetails.userName}</strong>
              </>
            ) : (
              <strong>Vehicle Vault Chat Box</strong>
            )}
          </div>

          {/* Messages */}
          <div className="flex-grow-1 overflow-auto p-3">
            {messages.length > 0 ? (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`d-flex mb-2 ${
                    msg.sender === currentUserId ? "justify-content-end" : "justify-content-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded ${
                      msg.sender === currentUserId
                        ? "bg-primary text-white"
                        : "bg-light text-dark"
                    }`}
                    style={{ maxWidth: "75%" }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center d-flex flex-column align-items-center justify-content-center h-100">
              <img 
                src={chatImage} 
                alt="No messages yet"
                style={{ width: "400px", maxHeight: "500px", objectFit: "contain" }}
              />
            </div>
            )}
          </div>

          {/* Input */}
          <div className="p-2 border-top bg-light">
            <div
              className="d-flex align-items-center px-2 py-1"
              style={{
                border: "1px solid #ddd",
                borderRadius: "30px",
                backgroundColor: "#f8f9fa",
                height: "40px",
              }}
            >
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none p-1"
                style={{ fontSize: "14px", height: "30px" }}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
              />
              <button
  className="btn btn-sm btn-primary ms-2 px-3"
  onClick={sendMessage}
  style={{ borderRadius: "20px" }}
>
<i class="fa-solid fa-paper-plane"></i>
</button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
