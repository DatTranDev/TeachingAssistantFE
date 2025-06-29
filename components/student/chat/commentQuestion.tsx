import { View, Text, Image, Alert, Modal, TouchableOpacity } from "react-native";
import { images } from "@/constants/image";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Pressable } from "react-native";
import deleteApi from "@/utils/delete";
import { localHost } from "@/utils/localhost";
import Feather from "@expo/vector-icons/Feather";
import SocketContext from "@/context/SocketContext";
import { formatDate } from "@/utils/formatDate";
import AntDesign from "@expo/vector-icons/AntDesign";
import post from "@/utils/post";

type Props = {
  id: string;
  content: string;
  createdAt: string;
  nameAnonymous: string;
  creator: {
    name: string;
    userCode: string;
    role: string;
    avatar: string;
    id: string;
  };
  cAttendId: string;
  upvotes:string[];
  downvotes:string[];
  handleDeletePost: (Id: string) => void;
};
export default function CommentQuestion({id, content, createdAt, nameAnonymous, creator, cAttendId, handleDeletePost, upvotes, downvotes}: Props) {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  if (!authContext) {
    return;
  } 
  const {user,accessToken} = authContext;
  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [myVote, setMyVote] = useState<"upvote" | "downvote" | null>(
    creator.id == user?.id
      ? null
      : upvotes.includes(user?.id || "")
      ? "upvote"
      : downvotes.includes(user?.id || "")
      ? "downvote"
      : null
  );
  const [listUpvote, setListUpvote] = useState<string[]>(upvotes);
  const [listDownvote, setListDownvote] = useState<string[]>(downvotes);
  useEffect(() => {
    setListUpvote(upvotes);
    setListDownvote(downvotes);
    setMyVote(creator.id == user?.id
      ? null
      : upvotes.includes(user?.id || "")
      ? "upvote"
      : downvotes.includes(user?.id || "")
      ? "downvote"
      : null);
  }, [upvotes, downvotes]);
  const deletePost = async () => {
    if (user?.id == creator.id) {
      const res = await deleteApi({
        url: `${localHost}/api/v1/discussion/delete/${id}`,
        token: accessToken,
      });
      if (res) {
        if (res.status == 200) {
          setReactionModalVisible(false);
          Alert.alert("Thành công", "Đã xóa bình luận");
          handleDeletePost(id);
          if (socketContext) {
            const { socket } = socketContext;
            socket.emit("sendDeleteMessage", {
              subjectID: cAttendId,
              messageID: id,
            });
          }
        }
      } else {
        Alert.alert("Thất bại", "Không thể xóa bình luận");
      }
    }
  };
  const handleVote = async (type: "upvote" | "downvote") => {
    if (creator.id !== user?.id) {
      const res = await post({
        url: `${localHost}/api/v1/discussion/${id}/vote`,
        data: { type: type },
        token: accessToken,
      });
      if (res) {
        if (res.status == 200) {
          if (socketContext) {
            const { socket } = socketContext;
            socket.emit("sendVote", {
              subjectID: cAttendId,
              message: {
                discussionId: id,
                type: type,
                userId: user?.id || "",
              },  
            });
          }
          if (!myVote) {
            setMyVote(type);
            if (type == "upvote") {
              setListUpvote([...listUpvote, user?.id || ""]);
            } else {
              setListDownvote([...listDownvote, user?.id || ""]);
            }
          } else {
            if (myVote == type) {
              setMyVote(null);
              if (type == "upvote") {
                setListUpvote(listUpvote.filter((item) => item != user?.id));
              } else {
                setListDownvote(listDownvote.filter((item) => item != user?.id));
              }
            } else {
              setMyVote(type);
              if (type == "upvote") {
                setListDownvote(listDownvote.filter((item) => item != user?.id));
                setListUpvote([...listUpvote, user?.id || ""]);
              } else {
                setListUpvote(listUpvote.filter((item) => item != user?.id));
                setListDownvote([...listDownvote, user?.id || ""]);
              }
            }
          }
        } else {
          Alert.alert("Thông báo", "Không thể vote");
        }
      }
      setReactionModalVisible(false);
    }
  };
    return (
      <>
        <Pressable
          onLongPress={() => {
            setReactionModalVisible(true);
          }}
          className="mt-3 w-[90%] ml-[5%] bg-gray-100 rounded-lg p-2 relative mb-1"
        >
          <View className="flex-row items-center">
            <Image
              source={images.avatarDefault}
              className="w-6 h-6 rounded-full"
            />
            <Text className=" text-sm ml-2 font-medium">{nameAnonymous}</Text>
            <Text className=" text-[12px] ml-2 font-regular text-gray_primary">
              {createdAt}
            </Text>
          </View>
          <Text className="text-[15px] ml-2 mt-1 leading-[21px]">{content}</Text>
          <View className="flex-row items-center ml-auto absolute -right-0 -bottom-[10px]">
            <AntDesign name="like1" size={18} color="green" />
            <Text className="text-[16px] ml-[3px] mr-[5px] text-gray-500">
              {listUpvote.length}
            </Text>
            <AntDesign name="dislike1" size={18} color="red" />
            <Text className="text-[16px] ml-[3px] mr-[5px] text-gray-500">
              {listDownvote.length}
            </Text>
          </View>
        </Pressable>
        <Modal
          animationType="fade"
          transparent={true}
          visible={reactionModalVisible}
          onRequestClose={() => setReactionModalVisible(false)}
        >
          <TouchableOpacity
            className="flex-1 justify-center items-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onPress={() => setReactionModalVisible(false)}
          >
            {user?.id == creator.id && (
              <View className="mt-2 bg-white  items-center p-2 rounded-xl">
                <TouchableOpacity onPress={deletePost} className="items-center">
                  <Feather name="trash" size={25} color="red" />
                  <Text className="text-[16px] mt-1">Xóa bình luận</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* vote */}
            {user?.id != creator.id && (
              <View className="bg-white py-3 px-4 rounded-xl">
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleVote("upvote")}
                    className={`p-1 ${
                      myVote == "upvote" ? "bg-gray-300/50 rounded-lg" : ""
                    }`}
                  >
                    <AntDesign name="like1" size={24} color="green" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleVote("downvote")}
                    className={`p-1 ${
                      myVote == "downvote" ? "bg-gray-300 rounded-md" : ""
                    }`}
                  >
                    <AntDesign name="dislike1" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Modal>
      </>
    );
}
