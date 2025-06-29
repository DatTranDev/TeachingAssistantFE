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
} from "react-native";
import { images } from "@/constants/image";
import { AntDesign, SimpleLineIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import Octicons from "@expo/vector-icons/Octicons";
import { icons } from "@/constants/icons";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import post from "@/utils/post";
import { localHost } from "@/utils/localhost";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import deleteApi from "@/utils/delete";
import { SocketContext } from "@/context/SocketContext";
import { Reaction } from "@/app/(studentDetail)/classDetail/discussionRoom";
import patch from "@/utils/patch";
import CommentQuestionTeacher from "./commentQuestionTeacher";

type Props = {
  Title: string;
  Content: string;
  Time: string;
  Id: string;
  Images: string[];
  nameAnonymous: string;
  CAttendId?: string;
  isResolved: boolean;
  reactions: Reaction[];
  myId: string | null;
  Creator: {
    name: string;
    userCode: string;
    role: string;
    avatar: string;
    id: string;
    email: string;
    school: string;
  };
  upvotes:string[];
  downvotes:string[];
  handleDeletePost: (Id: string) => void;
  handleKickStudent: (studentId: string) => void;
  handleReceiveReaction?: (reaction: Reaction) => void;
  comments: Comment[];
};
type ReactionShow = {
  type: number;
  count: number;
};
type Comment = {
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
    email: string;
    school: string;
  };
  upvotes:string[];
  downvotes:string[];
};

export default function postDiscussionTeacher({
  Content,
  Title,
  Time,
  Id,
  Images,
  CAttendId,
  nameAnonymous,
  isResolved,
  reactions,
  myId,
  Creator,
  handleReceiveReaction,
  handleDeletePost,
  handleKickStudent,
  comments,
  upvotes,
  downvotes,
}: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return;
  }
  const socketContext = useContext(SocketContext);
  const { user, accessToken } = authContext;
  const [selectedImage, setSelectedImage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [reaction, setReaction] = useState<ReactionShow[]>([]);
  const [reply, setReply] = useState(isResolved);
  const [showAllComments, setShowAllComments] = useState(false);
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
  useEffect(() => {
    resetReaction();
  }, [reactions]);
  useEffect(() => {
    setListUpvote(upvotes);
    setListDownvote(downvotes)
    setReply(isResolved);
  }, [upvotes, downvotes,isResolved]);
  const handleDownload = async (imageUrl: string) => {
    try {
      await Linking.openURL(imageUrl);
    } catch (error) {
      console.error("Không thể tải ảnh:", error);
    }
  };
  const deletePost = async () => {
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
  };
  const replyPost = async () => {
    if (!isResolved) {
      const res = await patch({
        url: `${localHost}/api/v1/discussion/update/${Id}`,
        token: accessToken,
        data: {
          isResolved: true,
        },
      });
      if (res) {
        if (res.status == 200) {
          isResolved = true;
          setReply(true);
          if (socketContext) {
            const { socket } = socketContext;
            socket.emit("sendResolve", { subjectID: CAttendId, messageID: Id });
          }
        } else {
          Alert.alert("Thất bại", "Không thể trả lời bài đăng");
        }
      }
    }
  };
  return (
    <View className="w-full ">
      {/* modal phản hồi */}
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
          <View className="mt-2 bg-white items-center py-2 rounded-lg flex-row px-1">
            <TouchableOpacity
              onPress={() => {
                setReactionModalVisible(false);
                replyPost();
              }}
              className="items-center mx-3"
            >
              <Feather name="check-circle" size={24} color="green" />
              <Text className="text-[14px] mt-[2px] text-gray_primary">
                Trả lời
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setInfoModalVisible(true);
                setReactionModalVisible(false);
              }}
              className="items-center mx-3"
            >
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={24}
                color="orange"
              />
              <Text className="text-[14px] mt-[2px] text-gray_primary">
                Hiển thị
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={deletePost}
              className="items-center mx-3"
            >
              <Feather name="trash" size={24} color="red" />
              <Text className="text-[14px] mt-[2px] text-gray_primary">
                Xóa bài
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* modal thông tin*/}
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setInfoModalVisible(false)}
        >
          <View className="bg-white mt-[25%]  py-5 rounded-2xl mx-3">
            <View className="items-center justify-center ">
              <View className=" border-blue_primary border-[2px] rounded-full p-[1px]">
                <Image
                  className="overflow-hidden w-20 h-20 rounded-full "
                  resizeMode="cover"
                  source={
                    Creator.avatar
                      ? {
                          uri: Creator.avatar,
                        }
                      : images.avatarDefault
                  }
                />
              </View>
              <Text className="text-[16px] font-medium mt-1">
                {Creator.name}
              </Text>
              <Text className="text-sm">
                {Creator.userCode} |{" "}
                {Creator.role == "student" ? "Sinh viên" : "Giảng viên"}
              </Text>
            </View>
            <View className="mt-4">
              <View className="flex-row items-center pl-[5%] border-b-[1px] mx-4 pb-1 border-gray_line">
                <MaterialCommunityIcons
                  name="email-outline"
                  size={24}
                  color="black"
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-base ml-[5%] pr-3"
                >
                  {Creator.email}
                </Text>
              </View>
              <View className="flex-row items-center pl-[5%] border-b-[1px] mx-4 pb-1 mt-3 border-gray_line">
                <MaterialCommunityIcons
                  name="school-outline"
                  size={25}
                  color="black"
                />
                <Text className="text-base ml-[5%]">{Creator.school}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleKickStudent(Creator.id)}
              className="flex-row mt-5 items-center mx-auto pr-2"
            >
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color="rgb(254 53 53)"
              />
              <Text className="text-xl ml-2 text-red">Mời khỏi lớp</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* modal xem ảnh */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          className="relative p-0 m-0 w-full h-full"
          style={{
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          <View className="flex-row absolute top-2 right-3 z-50">
            <TouchableOpacity
              className="ml-auto mr-[6px] bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
              onPress={() => handleDownload(selectedImage)}
            >
              <Octicons name="download" size={23} color={colors.blue_primary} />
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
              style={{
                resizeMode: "contain",
              }}
            />
          </View>
        </View>
      </Modal>
      <View className="w-[95%] bg-white mx-auto px-3 py-4 mt-5 rounded-md shadow-lg relative">
        {reply && (
          <View className="absolute px-2 py-1 top-[-12px] right-0 bg-white border border-gray-200 rounded-md shadow-lg flex-row items-center">
            <Text className=" text-[#34eb75]  rounded-md mr-1">Đã trả lời</Text>
            <Feather name="check" size={20} color="#34eb75" />
          </View>
        )}
        <Pressable
          onLongPress={() => {
            setReactionModalVisible(true);
          }}
        >
          <View className="flex-row mt-0 items-center">
            <View className="rounded-[30px] ml-0 w-[25px] h-[25px] overflow-hidden mt-auto">
              <Image
                resizeMode="cover"
                source={images.avatarDefault}
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
        {reply&& (
          <>
            <View className="border-t border-gray-200 mt-4 mx-2"></View>
            {(showAllComments ? comments.reverse() : comments.reverse().slice(0, 3)).map(
              (item, index) => (
                <CommentQuestionTeacher
                  key={index}
                  id={item.id}
                  content={item.content}
                  createdAt={item.createdAt}
                  nameAnonymous={item.nameAnonymous}
                  creator={item.creator}
                  cAttendId={CAttendId as string}
                  handleDeletePost={handleDeletePost}
                  handleKickStudent={handleKickStudent}
                  upvotes={item.upvotes}
                  downvotes={item.downvotes}
                />
              )
            )}
            {comments.length > 3 && (
              <TouchableOpacity
                className="items-center justify-center mt-2 flex-row"
                onPress={() => setShowAllComments(!showAllComments)}
              >
                <Text className="text-blue_primary mr-1 -mt-[2px]">
                  {showAllComments ? "Ẩn bớt" : "Xem thêm"}
                </Text>
                <SimpleLineIcons
                  name={showAllComments ? "arrow-up" : "arrow-down"}
                  size={12}
                  color={colors.blue_primary}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}
