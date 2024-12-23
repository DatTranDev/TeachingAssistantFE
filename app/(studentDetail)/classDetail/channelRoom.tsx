import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, KeyboardAvoidingView, TextInput, Modal, Linking, ActivityIndicator, Alert, Keyboard } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';

import post from '@/utils/post';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { AuthContext } from '@/context/AuthContext'
import { SocketContext } from '@/context/SocketContext';
import get from '@/utils/get';
import Loading from '@/components/ui/Loading';
import Feather from '@expo/vector-icons/Feather';
import { EvilIcons, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { localHost } from '@/utils/localhost';
import ButtonCustom from '@/components/ui/ButtonCustom';
import Post from '@/components/student/chat/post';
import { colors } from '@/constants/colors';


export type Post = {
  _id: string,
  channelId: string;
  creator: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  __v: string;
  id: string;
  user: {
    _id: string;
    name: string;
    userCode: string;
    school: string;
    email: string;
    role: string;
    avatar: string;
    __v: string;
    id: string;
  }

}

type FormatName = {
  id: string,
  number: number
}
export default function ChannelRoom() {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  const router = useRouter()
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const { channelId, name, subjectId, subjectName } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [PostList, setPostList] = useState<Post[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(0);

  const [refreshing, setRefreshing] = useState(false);
  const [checkScroll, setcheckScroll] = useState(true);
  const [visible, setVisible] = useState(false)
  const [titlePost, setTitlePost] = useState('')
  const [contentPost, setContentPost] = useState('')
  const handleLoadMore = async () => {
    setPage(page + 1);
  };
  const onRefresh = () => {
    setRefreshing(true);
    handleLoadMore().then(() => setRefreshing(false));
  };
  useEffect(() => {
    setPage(0);
  }, [isFocused])
  //Connect to socket
  useEffect(() => {
    if (socketContext) {
      const { socket } = socketContext;
      console.log('socket id in post screen: ', socket?.id);
      if (socket) {
        socket.emit('joinSubjectChannel', { userID: user?.id,subjectID: subjectId, channelID: channelId });
        socket.on('receiveChannelMessage', (message: Post) => {
          if(message.creator!==user?.id)
          setPostList((prevList) => [...prevList, message]);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }
    }
    return () => {
      if (socketContext) {
        const { socket } = socketContext;
        if (socket) {
          socket.emit('leaveSubjectChannel', { userID: user?.id,subjectID: subjectId, channelID: channelId });
          socket.off('receiveChannelMessage');
        }
      }
    };
  }, [socketContext]);
  const formatTimePost = (time: Date) => {
    const hours = Math.floor(time.getHours());
    const minutes = Math.floor(time.getMinutes());
    const formattedMinutes = String(minutes).padStart(2, '0');
    let formattedHours = String(hours).padStart(2, '0');


    return `${time.getDate().toString().padStart(2, '0')}/${(time.getMonth() + 1).toString().padStart(2, '0')} ${formattedHours}:${formattedMinutes}`;
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    return formattedDate;
  };

  const renderPost = () => {
    const list: JSX.Element[] = [];
    const totalMessages = PostList.length;

    if (totalMessages === 0) {
      return (
        <Text className='text-blue_primary' style={{ marginHorizontal: "auto", marginVertical: "auto", fontSize: 18, marginTop: "80%" }}>
          Đặt câu hỏi tại đây !
        </Text>
      );
    }

    const start = totalMessages >= (page * 4 + 10) ? totalMessages - (page * 4 + 10) : 0;

    for (let i = start; i < totalMessages; i++) {
      let sender = '';
      const currentPost = PostList[i];
      const time = new Date(currentPost.createdAt);

      // Hiển thị ngày nếu cần
      if (i > 0) {
        const previousPostTime = new Date(PostList[i - 1].createdAt);
        if (previousPostTime.getDate() !== time.getDate()) {
          list.push(
            <Text key={formatDateTime(currentPost.createdAt)} className="bg-[#BBB3B3] rounded-[10px] py-[3px] max-w-[200px] font-semibold text-[10px] mt-[15px] mb-[15px] mx-auto text-white px-[7px]">
              {formatDateTime(currentPost.createdAt)}
            </Text>
          );
        }
      }
      list.push(
        <Post
          key={currentPost._id}
          Content={currentPost.content}
          Time={formatTimePost(time)}
          Avatar={currentPost.user.avatar}
          Title={currentPost.title}
          UserCode={currentPost.user.userCode}
          Name={currentPost.user.name}
        />
      );
    }
    return list;
  };

  const loadPost = async () => {
    setLoading(true);
    const url = `${localHost}/api/v1/channel/post/find/${channelId}`
    const response = await get({ url: url, token: accessToken });
    if (response) {
      if (response.status == 200) {
        const list = await response.data;
        setPostList(list.posts)

      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi");
      }
    }
    // else{
    //   Alert.alert("Thông báo","Đã xảy ra lỗi");
    // }

    setLoading(false);
  }

  const generateID = () => {

    const codeInit = "qwertyuiopasdfghjklzxcvbnm1234567890"
    let code = ""
    for (let i = 0; i < 10; i++) {
      const index = Math.floor(Math.random() * codeInit.length)
      code += codeInit.charAt(index)
    }
    return code
  }
  const sendPost = async () => {
    if (!contentPost || !titlePost) {
      return;
    }
    setUploading(true);
    const dataPost = {
      channelId: `${channelId}`,
      creator: `${user?.id}`,
      title: `${titlePost}`,
      content: `${contentPost}`
    }

    const idMsg = generateID()

    if (user) {
      const msg: Post = {
        _id: idMsg,
        channelId: `${channelId}`,
        creator: `${user?.id}`,
        title: `${titlePost}`,
        content: `${contentPost}`,
        createdAt: `${new Date().toISOString()}`,
        updatedAt: `${new Date().toISOString()}`,
        __v: '0',
        id: idMsg,
        user: {
          _id: `${user?.id}`,
          name: `${user?.name}`,
          userCode: `${user?.userCode}`,
          school: `${user?.school}`,
          email: `${user?.email}`,
          role: `${user?.role}`,
          avatar: `${user?.avatar}`,
          __v: `0`,
          id: `${user?.id}`,
        }

      }

      setPostList((prevList) => [...prevList, msg])

      const url = `${localHost}/api/v1/channel/post/add`;

      const response = await post({ url: url, data: dataPost, token: accessToken });

      if (response) {
        console.log(response)
        if(socketContext?.socket){
          const dataMsg = {
            title: `${name} - ${subjectName}`,//VD: Nhóm 1 - Phương pháp phát triển phần mềm hướng đối tượng
            body: msg.title,//Nội dung tin nhắn
            type: 'message',//Loại tin nhắn
            senderId: user.id,//ID người gửi
            sender: user.name,//Tên người gửi
            subject: `${name} - ${subjectName}`,//VD: Nhóm 1 - Phương pháp phát triển phần mềm hướng đối tượng
            room: ""//Phòng học
          }
          socketContext.socket.emit('sendMessageToChannel', {subjectID:subjectId, channelID: channelId, message:msg, dataMsg:dataMsg});
        }
        if (response.status != 201) {
          const msgList = PostList.filter((value) => value._id !== idMsg)

          setPostList(msgList)

          Alert.alert(
            'Thông báo',
            'Không thể đăng bài',)
          return false
        }
      }
    }
    setContentPost('')
    setTitlePost('')
    setVisible(false);
    setUploading(false)

  }
  useEffect(() => {

    loadPost();
  }, []);
  useEffect(() => {
    // Lắng nghe sự kiện bàn phím
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Thực hiện hành động khi bàn phím xuất hiện
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    // Xóa bỏ lắng nghe khi component bị unmount
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Modal visible={visible} className='flex-1' transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center z-50 relative" style={{ backgroundColor: 'rgba(170, 170, 170, 0.8)' }}>
          <TouchableOpacity onPress={() => setVisible(false)} className='ml-auto mr-[3%] mt-[-8px] mb-1'>
            <FontAwesome name="close" size={28} color="black" />
          </TouchableOpacity>
          <View className='bg-white px-[8%] w-[90%]  pt-3 pb-4 rounded-lg shadow-lg'>
            <Text className='text-lg font-msemibold mb-4 mx-auto'>Đăng bài vào kênh {name}</Text>
            <Text className='text-base font-mmedium'>Tiêu đề</Text>

            <View className='  bg-[#F5F5F5] mt-3 py-2 px-3'>
              <TextInput value={titlePost} onChangeText={(e) => setTitlePost(e)} className='text-base leading-[22px]' />
            </View>
            <Text className='text-base font-mmedium mt-3'>Nội dung</Text>

            <View className='  bg-[#F5F5F5] mt-3 py-2 px-3'>
              <TextInput value={contentPost} onChangeText={(e) => setContentPost(e)} className='text-base leading-[22px] h-[100px]' multiline={true} textAlignVertical="top" numberOfLines={5} />
            </View>
            <ButtonCustom handle={sendPost} content='Đăng bài' otherStyle='mt-5 w-[60%]' />
          </View>
        </View>

      </Modal>

      <View className="justify-center h-full flex-1 w-full relative">

        <View className='h-[54] w-full justify-start items-center flex-row mt-[9%] px-[4%]'>
          <TouchableOpacity className='' onPress={() => router.back()} >
            <Ionicons name="chevron-back" size={24} color="black" style={{ marginRight: 'auto', marginTop: 3 }} />
          </TouchableOpacity >
          <Text className="font-semibold text-xl mx-auto" numberOfLines={1} ellipsizeMode="tail">{name}</Text>
        </View>
        <LinearGradient style={{ height: 1.2, backgroundColor: '#F7F7F7' }}
          colors={["#C0BDBD", "#ffffff"]}>
        </LinearGradient>


        {isLoading ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color={colors.blue_primary} animating={true} />
          </View>
        ) :
          (
            <ScrollView className="flex-1 w-full"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: 'flex-end',
                paddingVertical: 0,
                paddingHorizontal: '0.5%'
              }}
              onContentSizeChange={(contentWidth, contentHeight) => {
                if (checkScroll) {
                  scrollViewRef?.current?.scrollToEnd({ animated: true });
                  setcheckScroll(false);
                }
              }}
              ref={scrollViewRef}
              onScroll={({ nativeEvent }) => {
                if (nativeEvent.contentOffset.y <= 0) {
                  handleLoadMore();
                }
              }}
              scrollEventThrottle={16}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              {renderPost()}
              <View className="h-16"></View>


            </ScrollView>

          )
        }
        {/* bottom */}
        <View >
          <TouchableOpacity onPress={() => setVisible(true)} className='absolute bottom-3 right-4 bg-blue_primary flex-row py-[6px] px-3 items-center
              rounded-lg shadow-md'>
            <FontAwesome name="pencil-square-o" size={24} color="white" />
            <Text className='text-white font-mmedium ml-2 text-base my-auto text-center'>Đăng bài</Text>
          </TouchableOpacity>


        </View>


        <Loading loading={isUploading} />
      </View>
    </KeyboardAvoidingView>

  )
}
