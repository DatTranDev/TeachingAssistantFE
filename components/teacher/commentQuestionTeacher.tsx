import {
  View,
  Text,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { images } from "@/constants/image";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Pressable } from "react-native";
import deleteApi from "@/utils/delete";
import { localHost } from "@/utils/localhost";
import Feather from "@expo/vector-icons/Feather";
import SocketContext from "@/context/SocketContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDate } from "@/utils/formatDate";
import AntDesign from "@expo/vector-icons/AntDesign";

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
    email: string;
    school: string;
  };
  cAttendId: string;
  upvotes:string[];
  downvotes:string[];
  handleDeletePost: (Id: string) => void;
  handleKickStudent: (id: string) => void;
};
export default function CommentQuestionTeacher({
  id,
  content,
  createdAt,
  nameAnonymous,
  creator,
  cAttendId,
  upvotes,
  downvotes,
  handleDeletePost,
  handleKickStudent,
}: Props) {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [listUpvote, setListUpvote] = useState<string[]>(upvotes);
  const [listDownvote, setListDownvote] = useState<string[]>(downvotes);
  useEffect(() => {
    setListUpvote(upvotes);
    setListDownvote(downvotes);
  }, [upvotes, downvotes]);
  const deletePost = async () => {
    const res = await deleteApi({
      url: `${localHost}/api/v1/discussion/delete/${id}`,
      token: accessToken,
    });
    if (res) {
      if (res.status == 200) {
        setReactionModalVisible(false);
        setInfoModalVisible(false);
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
  };
  return (
    <>
      <Pressable
        onLongPress={() => {
          setReactionModalVisible(true);
        }}
        className="mt-3 w-[90%] ml-[5%] bg-gray-100 rounded-lg p-2 relative"
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
                Xóa bình luận
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
                    creator.avatar
                      ? {
                          uri: creator.avatar,
                        }
                      : images.avatarDefault
                  }
                />
              </View>
              <Text className="text-[16px] font-medium mt-1">
                {creator.name}
              </Text>
              <Text className="text-sm">
                {creator.userCode} |{" "}
                {creator.role == "student" ? "Sinh viên" : "Giảng viên"}
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
                  {creator.email}
                </Text>
              </View>
              <View className="flex-row items-center pl-[5%] border-b-[1px] mx-4 pb-1 mt-3 border-gray_line">
                <MaterialCommunityIcons
                  name="school-outline"
                  size={25}
                  color="black"
                />
                <Text className="text-base ml-[5%]">{creator.school}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleKickStudent(creator.id)}
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
    </>
  );
}
