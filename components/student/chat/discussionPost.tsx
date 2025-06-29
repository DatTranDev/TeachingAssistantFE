import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  Modal,
  TouchableOpacity,
  Linking,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { images } from "@/constants/image";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import Octicons from "@expo/vector-icons/Octicons";
import { icons } from "@/constants/icons";
import Feather from "@expo/vector-icons/Feather";
import post from "@/utils/post";
import { localHost } from "@/utils/localhost";
import { AuthContext } from "@/context/AuthContext";
import deleteApi from "@/utils/delete";
import {
  Discussion,
  Reaction,
} from "@/app/(studentDetail)/classDetail/discussionRoom";
import patch from "@/utils/patch";
import { downloadImage } from "@/utils/downloadImage";
import { SocketContext } from "@/context/SocketContext";
import CommentQuestion from "./commentQuestion";
import ButtonCustom from "@/components/ui/ButtonCustom";
import { SimpleLineIcons } from "@expo/vector-icons";
export type Comment = {
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
  upvotes:string[];
  downvotes:string[];
};
type Props = {
  Title: string;
  Content: string;
  Time: string;
  Id: string;
  CAttendId: string | string[];
  Images: string[];
  nameAnonymous: string;
  isResolved: boolean;
  reactions: Reaction[];
  myId: string | null;
  Creator: {
    name: string;
    userCode: string;
    role: string;
    avatar: string;
    id: string;
  };
  comments: Comment[];
  upvotes:string[];
  downvotes:string[];
  handleDeletePost: (Id: string) => void;
  addComment: (item: Discussion) => void;
};
type ReactionShow = {
  type: number;
  count: number;
};

export default function DiscussionPost({
  Content,
  Title,
  Time,
  Id,
  CAttendId,
  Images,
  nameAnonymous,
  isResolved,
  reactions,
  myId,
  Creator,
  comments,
  handleDeletePost,
  addComment,
  upvotes,
  downvotes,
}: Props) {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const [selectedImage, setSelectedImage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [myReaction, setMyReaction] = useState<Reaction | null>(
    reactions.find((item) => item.userId.id == myId) || null
  );
  const [myVote, setMyVote] = useState<"upvote" | "downvote" | null>(
    Creator.id == myId ? null : upvotes.includes(myId || "") ? "upvote" : downvotes.includes(myId || "") ? "downvote" : null
  );
  const [reaction, setReaction] = useState<ReactionShow[]>([]);
  const [listUpvote, setListUpvote] = useState<string[]>(upvotes);
  const [listDownvote, setListDownvote] = useState<string[]>(downvotes);
  const resetReaction = () => {
    const reactionCount = reactions.reduce((acc: any, item: Reaction) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    // Cập nhật state reaction với đối tượng đếm
    setReaction(
      Object.entries(reactionCount).map(([type, count]) => ({
        type: Number(type),
        count: count as number,
      }))
    );
  };
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  useEffect(() => {
    resetReaction();
  }, [isResolved, reactions]);
  useEffect(() => {
    setListUpvote(upvotes);
    setListDownvote(downvotes);
    setMyVote( Creator.id == myId ? null : upvotes.includes(myId || "") ? "upvote" : downvotes.includes(myId || "") ? "downvote" : null    );
  }, [upvotes, downvotes, Creator.id, myId]);
  const handleDownload = async (imageUrl: string) => {
    try {
      await Linking.openURL(imageUrl);
    } catch (error) {
      console.error("Không thể tải ảnh:", error);
    }
  };
  const addReaction = async (type: number) => {
    if (myReaction) {
      if (type != myReaction.type) {
        const res = await patch({
          url: `${localHost}/api/v1/discussion/reaction/update/${myReaction.id}`,
          data: { type: type },
          token: accessToken,
        });
        if (res) {
          if (res.status == 200) {
            reactions.forEach((item) => {
              if (item.id == myReaction.id) {
                item.type = type;
              }
            });
            resetReaction();
            setMyReaction({ ...myReaction, type: type });
            if (socketContext) {
              const { socket } = socketContext;
              let ins = myReaction;
              ins.type = type;
              ins.discussionId = Id;
              socket.emit("sendUpdateReaction", {
                subjectID: CAttendId,
                messageID: Id,
                reaction: ins,
              });
            }
          } else {
            ``;
            Alert.alert("Thất bại", "Không thể cập nhật phản hồi");
          }
        }
      }
    } else {
      const res = await post({
        url: `${localHost}/api/v1/discussion/reaction/add`,
        data: { userId: myId, discussionId: Id, type: type },
        token: accessToken,
      });
      if (res) {
        if (res.status == 201) {
          let newReaction: Reaction = {
            type: type,
            id: res.data.reaction.id,
            userId: {
              id: myId || "",
              name: user?.name || "",
              userCode: user?.userCode || "",
              avatar: user?.avatar || "",
            },
          };
          setMyReaction(newReaction);
          setReaction((prev) => {
            const existingReaction = prev.find((item) => item.type === type);
            if (existingReaction) {
              return prev.map((item) =>
                item.type === type ? { ...item, count: item.count + 1 } : item
              );
            } else {
              return [...prev, { type: type, count: 1 }];
            }
          });
          if (socketContext) {
            const { socket } = socketContext;
            newReaction.discussionId = Id;
            socket.emit("sendReaction", {
              subjectID: CAttendId,
              messageID: Id,
              reaction: newReaction,
            });
          }
        } else {
          Alert.alert("Thất bại", "Không thể thêm phản hồi");
        }
      }
    }

    setReactionModalVisible(false);
  };
  const deletePost = async () => {
    if (myId == Creator.id) {
      const res = await deleteApi({
        url: `${localHost}/api/v1/discussion/delete/${Id}`,
        token: accessToken,
      });
      if (res) {
        if (res.status == 200) {
          setReactionModalVisible(false);
          Alert.alert("Thành công", "Đã xóa bài đăng");
          handleDeletePost(Id);
          if (socketContext) {
            const { socket } = socketContext;
            socket.emit("sendDeleteMessage", {
              subjectID: CAttendId,
              messageID: Id,
            });
          }
        }
      } else {
        Alert.alert("Thất bại", "Không thể xóa bài đăng");
      }
    }
  };
  const sendComment = async () => {
    if (!commentContent.trim()) {
      return;
    }
    let discussion = {
      cAttendId: `${CAttendId}`,
      creator: `${user?.id}`,
      content: `${commentContent}`,
      title: "",
      images: [],
      replyOf: Id,
      isResolved: false,
    };

    if (user) {
      const url = `${localHost}/api/v1/discussion/add`;
      const response = await post({
        url: url,
        data: discussion,
        token: accessToken,
      });
      if (response) {
        if (response.status == 201) {
          addComment(response.data.discussion);
          // if(socketContext){
          //  const { socket } = socketContext;
          //  socket.emit('sendReply', {
          //   subjectID: CAttendId,
          //   message: response.data.discussion
          //  })
          // }
        } else {
          Alert.alert("Thông báo", "Không thể gửi");
        }
      }
    }
    setCommentContent("");
    setCommentModalVisible(false);
  };
  const handleVote = async (type: "upvote" | "downvote") => {
    if(Creator.id !== myId && !isResolved)
    {
      const res = await post({
        url: `${localHost}/api/v1/discussion/${Id}/vote`,
        data: { type: type },
        token: accessToken,
      });
      if (res) {
        if (res.status == 200) {
          if (socketContext) {
            const { socket } = socketContext;
            socket.emit("sendVote", {
              subjectID: CAttendId,
              message: {
                discussionId: Id,
                type: type,
                userId: myId || "",
              },  
            });
          }
          if(!myVote)
          {
            setMyVote(type);
            if (type == "upvote") {
              setListUpvote([...listUpvote, myId || ""]);
            } else {
              setListDownvote([...listDownvote, myId || ""]);
            }
          } else {
              if(myVote == type)
              {
                setMyVote(null);
                if (type == "upvote") {
                  setListUpvote(listUpvote.filter((item) => item != myId));
                } else {
                  setListDownvote(listDownvote.filter((item) => item != myId));
                }
              } else {
                setMyVote(type);
                if(type == "upvote")
                {
                  setListDownvote(listDownvote.filter((item) => item != myId));
                  setListUpvote([...listUpvote, myId || ""]);
                } else {
                  setListUpvote(listUpvote.filter((item) => item != myId));
                  setListDownvote([...listDownvote, myId || ""]);
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
    <View className="w-full mt-2 ">
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
          {isResolved && (
            <View className="bg-white py-3 px-4 rounded-xl">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => addReaction(1)}
                  className={`p-1 ${
                    myReaction?.type == 1 ? "bg-gray-300/50 rounded-lg" : ""
                  }`}
                >
                  <Image source={icons.react1} className="w-[30px] h-[30px]" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => addReaction(2)}
                  className={`p-1 ${
                    myReaction?.type == 2 ? "bg-gray-300 rounded-md" : ""
                  }`}
                >
                  <Image source={icons.react2} className="w-[30px] h-[30px]" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => addReaction(3)}
                  className={`p-1 ${
                    myReaction?.type == 3 ? "bg-gray-300 rounded-md" : ""
                  }`}
                >
                  <Image source={icons.react3} className="w-[30px] h-[30px]" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {myId == Creator.id && (
            <View className="mt-2 bg-white  items-center p-2 rounded-xl">
              <TouchableOpacity onPress={deletePost} className="items-center">
                <Feather name="trash" size={25} color="red" />
                <Text className="text-[16px] mt-1">Xóa bài đăng</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* vote */}
          {!isResolved && myId != Creator.id && (
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

      <View className="w-[95%] bg-white mx-auto px-3 py-4 mt-5 rounded-md shadow-lg relative">
        {isResolved && (
          <View className="absolute px-2 py-1 top-[-14px] right-0 bg-white border border-gray-200 rounded-md shadow-lg flex-row items-center">
            <Text className=" text-[#34eb75]  rounded-md mr-1">Đã trả lời</Text>
            <Feather name="check" size={20} color="#34eb75" />
          </View>
        )}
        <Pressable
          onLongPress={() => {
            if (isResolved || myId == Creator.id || (!isResolved && myId != Creator.id)) setReactionModalVisible(true);
          }}
        >
          <View className="flex-row mt-0 items-center">
            <View className="rounded-[30px] ml-0 w-[25px] h-[25px] overflow-hidden mt-auto">
              <Image
                resizeMode="cover"
                source={
                  Creator.id == myId
                    ? Creator.avatar == "" || !Creator.avatar
                      ? images.avatarDefault
                      : { uri: Creator.avatar }
                    : images.avatarDefault
                }
                className="w-full h-full"
              />
            </View>
            <Text className="text-blue_primary ml-2 text-[15px]">
              {nameAnonymous}
            </Text>
            <Text className="ml-2 text-[12px] text-center font-mregular mt-[1px] text-gray_primary">
              {Time}
            </Text>
          </View>
          <Text className="text-xl font-msemibold mt-2 ml-1">{Title}</Text>
          <Text className="mt-1 ml-1 text-[15px] font-mregular">{Content}</Text>
          <View className="flex-row flex-wrap mt-2 px-2 ">
            {Images.map((image, index) => (
              <TouchableOpacity
                key={index}
                className="mb-2 relative rounded-md border border-gray-200 w-[30%] mr-[3.3%]"
                onPress={() => {
                  setSelectedImage(image);
                  setModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: image }}
                  className="w-full aspect-square rounded-md"
                />
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row gap-[1px] -mb-2 ml-1 mt-[4px] justify-between ">
            <View className="flex-row">
            {reaction.map((item, index) => (
              <View key={index} className="flex-row items-center">
                <Image
                  source={
                    item.type === 1
                      ? icons.react1
                      : item.type === 2
                      ? icons.react2
                      : icons.react3
                  }
                  className="w-[25px] h-[25px]"
                />
                <Text className="text-[16px] ml-[3px] mr-[5px] text-gray-400">
                  {item.count}
                </Text>
              </View>
            ))}
            </View>
            {/* vote */}
            <View className="flex-row items-center">
              <AntDesign name="like1" size={24} color="green" />
              <Text className="text-[16px] ml-[3px] mr-[5px] text-gray-400">
                {listUpvote.length}
              </Text>
              <AntDesign name="dislike1" size={24} color="red" />
              <Text className="text-[16px] ml-[3px] mr-[5px] text-gray-400">
                {listDownvote.length}
              </Text>
            </View>
          </View>
        </Pressable>
        {isResolved && (
          <>
            <View className="border-t border-gray-200 mt-4 mx-2"></View>
            {(showAllComments ? comments : comments.slice(0, 3)).map(
              (item, index) => (
                <CommentQuestion
                  key={index}
                  id={item.id}
                  content={item.content}
                  createdAt={item.createdAt}
                  nameAnonymous={item.nameAnonymous}
                  creator={item.creator}
                  cAttendId={CAttendId as string}
                  handleDeletePost={handleDeletePost}
                  upvotes={item.upvotes||[]}
                  downvotes={item.downvotes||[]}
                />
              )
            )}
            <TouchableOpacity
              className="items-center justify-end mt-2 flex-row -mb-2 mr-[5%]"
              onPress={() => setShowAllComments(!showAllComments)}
            >
              <Text className="text-blue_primary mr-1 -mt-[2px]">
                {showAllComments ? "Thu gọn" : "Xem thêm"}
              </Text>
              <SimpleLineIcons
                name={showAllComments ? "arrow-up" : "arrow-down"}
                size={12}
                color={colors.blue_primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setCommentModalVisible(true);
                setCommentContent("");
              }}
              className="-mb-8 mt-3 bg-white rounded-full p-1 items-center justify-center border border-gray-200 flex-row w-[130px]"
            >
              <MaterialCommunityIcons
                name="comment-edit-outline"
                size={26}
                color={colors.blue_primary}
              />
              <Text className="text-sm font-mregular ml-2">Bình luận</Text>
            </TouchableOpacity>
          </>
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            className="relative p-0 m-0 w-full h-full"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <View className="flex-row absolute top-2 right-3 z-50">
              <TouchableOpacity
                className="ml-auto mr-[6px] bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
                onPress={() => downloadImage(selectedImage)}
              >
                <Octicons
                  name="download"
                  size={23}
                  color={colors.blue_primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-auto bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={23} color="red" />
              </TouchableOpacity>
            </View>

            <View className="w-full h-[85%] my-auto">
              <Image
                className="w-full h-full"
                source={{ uri: selectedImage }}
                style={{ resizeMode: "contain" }}
              />
            </View>
          </View>
        </Modal>
        {/* Modal bình luận */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={commentModalVisible}
          onRequestClose={() => {
            setCommentModalVisible(false);
            setCommentContent("");
          }}
        >
          <View
            className="relative p-0 m-0 w-full h-full"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <View className="bg-white rounded-lg p-4 w-[80%] mx-auto my-auto relative ">
              <TouchableOpacity
                onPress={() => setCommentModalVisible(false)}
                className="absolute -top-7 -right-3 p-1"
              >
                <AntDesign name="close" size={23} color="red" />
              </TouchableOpacity>
              <Text className="text-sm font-msemibold text-center">
                Bình luận về câu hỏi của {nameAnonymous}
              </Text>
              <View className=" mt-4 py-2 px-3  border border-gray-300 rounded-md">
                <TextInput
                  value={commentContent}
                  onChangeText={(e) => setCommentContent(e)}
                  className="text-[15px] leading-[22px] h-[100px]"
                  multiline={true}
                  textAlignVertical="top"
                  numberOfLines={5}
                  placeholder="Nhập bình luận..."
                />
              </View>
              <ButtonCustom
                content="Gửi"
                handle={sendComment}
                otherStyle="w-[130px] mx-auto mt-4 -mb-1"
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
