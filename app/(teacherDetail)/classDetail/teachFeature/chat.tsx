import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Modal,
  Linking,
  ActivityIndicator,
  Alert,
  Keyboard
} from 'react-native';
// import { icons } from "@constants";
// import { styles } from "./mainRoom.style";
import { Question } from '@/components/student/question';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import mime from 'react-native-mime-types';
import {
  useNavigation,
  useIsFocused,
  useFocusEffect
} from '@react-navigation/native';
import post from '@/utils/post';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { SocketContext } from '@/context/SocketContext';
import get from '@/utils/get';
import Loading from '@/components/ui/Loading';
import Feather from '@expo/vector-icons/Feather';
import { EvilIcons, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { localHost } from '@/utils/localhost';
import { ChatContainer } from '@/components/teacher/chat';
import { colors } from '@/constants/colors';

export type Question = {
  _id: string;
  subjectId: string;
  content: string;
  studentId: {
    name: string;
    userCode: string;
    role: string;
    avatar: string;
    id: string;
    email: string;
    school: string;
  };
  createdAt: string;
  type: string;
  isResolved: boolean;
  updatedAt: string;
  __v: string;
  id: string;
};

type FormatName = {
  id: string;
  number: number;
};
export default function Chat() {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  const router = useRouter();
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const [listFormat, setListFormat] = useState<FormatName[]>([]);
  const { subjectId, name, code } = useLocalSearchParams();
  const [numberName, setNumberName] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkScroll, setcheckScroll] = useState(true);
  const handleLoadMore = async () => {
    setPage(page + 1);
  };
  const onRefresh = () => {
    setRefreshing(true);
    handleLoadMore().then(() => setRefreshing(false));
  };
  //Connect to socket
  useEffect(() => {
    if (socketContext) {
      console.log('socket: ', socketContext.socket.id);
      const { socket } = socketContext;
      if (socket) {
        socket.emit('joinSubject', { userID: user?.id, subjectID: subjectId });
        socket.on('receiveSubjectMessage', (message: Question) => {
          if (message.studentId.id != user?.id)
            setQuestionList(prevList => [...prevList, message]);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }
    }
    return () => {
      if (socketContext) {
        const { socket } = socketContext;
        if (socket) {
          socket.emit('leaveSubject', {
            userID: user?.id,
            subjectID: subjectId
          });
          socket.off('receiveSubjectMessage');
        }
      }
    };
  }, [socketContext]);

  useEffect(() => {
    setPage(0);
  }, [isFocused]);
  useEffect(() => {
    loadQuestion();
  }, []);
  useEffect(() => {
    // Lắng nghe sự kiện bàn phím
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Thực hiện hành động khi bàn phím xuất hiện
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );

    // Xóa bỏ lắng nghe khi component bị unmount
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const formatTimeQuestion = (time: Date) => {
    const hours = Math.floor(time.getHours());
    const minutes = Math.floor(time.getMinutes());
    const formattedMinutes = String(minutes).padStart(2, '0');
    let formattedHours = String(hours).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const formattedDate = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
    return formattedDate;
  };
  const checkTimeDifference = (dateTime1: Date, dateTime2: Date) => {
    const diff = Math.abs(dateTime2.getTime() - dateTime1.getTime()); // Lấy giá trị tuyệt đối của hiệu hai thời điểm

    // Chuyển đổi từ milliseconds sang phút
    const diffMinutes = Math.floor(diff / (1000 * 60)); // 1000 milliseconds = 1 giây, 60 giây = 1 phút

    // Kiểm tra nếu hiệu của hai thời điểm lớn hơn 10 phút
    return diffMinutes > 5;
  };
  const kickStudent= async (studentId:string)=>{
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn mời người này ra khỏi lớp học này không?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            setUploading(true)
            const res = await post({
              url: `${localHost}/api/v1/subject/leave`,
              data: { studentId: studentId, subjectId: subjectId },
              token: accessToken
            });
            setUploading(false)
            if (res) {
              if (res.status == 200) {
                await loadQuestion()
                Alert.alert('Thông báo', "Đã mời sinh viên ra khỏi lớp học thành công");
              } else {
                Alert.alert('Lỗi', "Đã xảy ra lỗi");
              }
            }
          }
        }
      ]
    );
  }
 

  const renderQuestion = () => {
    const list: JSX.Element[] = [];
    const totalMessages = questionList.length;

    if (totalMessages === 0) {
      return (
        <Text
          className='mx-auto text-base text-blue_primary mt-[80%]'>
          Thảo luận cùng nhau tại đây !
        </Text>
      );
    }

    const start =
      totalMessages >= page * 4 + 15 ? totalMessages - (page * 4 + 15) : 0;

    for (let i = start; i < totalMessages; i++) {
      let sender = '';
      const currentQuestion = questionList[i];
      const time = new Date(currentQuestion.createdAt);

      // Hiển thị ngày nếu cần
      if (i > 0) {
        const previousQuestionTime = new Date(questionList[i - 1].createdAt);
        if (previousQuestionTime.getDate() !== time.getDate()) {
          list.push(
            <Text
              key={formatDateTime(currentQuestion.createdAt)}
              className='bg-[#BBB3B3] rounded-[10px] py-[3px] max-w-[200px] font-semibold text-[10px] mt-[15px] mb-[15px] mx-auto text-white px-[7px]'>
              {formatDateTime(currentQuestion.createdAt)}
            </Text>
          );
        }
      }

      sender = currentQuestion.studentId.id === user?.id ? 'My message' : '';
      // Xử lý ẩn danh
      if (!sender) {
        if (
          i === 0 ||
          (i > 0 &&
            (currentQuestion.studentId.id !==
              questionList[i - 1].studentId.id ||
              time.getDate() !==
                new Date(questionList[i - 1].createdAt).getDate()))
        ) {
          const formatName = listFormat.find(
            item => item.id === currentQuestion.studentId.id
          );
          if (formatName) {
            list.push(
              <Text key={`${formatName.number}${i}`} className='mr-auto ml-9'>
                Ẩn danh {formatName.number}
              </Text>
            );
          } else {
            const num = numberName + 1;
            listFormat.push({
              id: currentQuestion.studentId.id,
              number: numberName + 1
            });
            setNumberName(numberName + 1);
            list.push(
              <Text key={num} className='mr-auto ml-9'>
                Ẩn danh {num}
              </Text>
            );
          }
        }
      }
      // Xử lý hiển thị câu hỏi
      const isSameSender =
        i + 1 < totalMessages &&
        currentQuestion.studentId.id === questionList[i + 1].studentId.id &&
        time.getDate() == new Date(questionList[i + 1].createdAt).getDate();
      let shouldDisplayTime =
        i < totalMessages - 1 &&
        checkTimeDifference(time, new Date(questionList[i + 1].createdAt));
      //Tin nhắn cuối cùng luôn hiển thị thời gian
      if (i == totalMessages - 1) {
        shouldDisplayTime = true;
      }

      list.push(
        <ChatContainer  
          key={currentQuestion._id}
          Id={currentQuestion._id}
          User={sender}
          Content={currentQuestion.content}
          Time={shouldDisplayTime ? formatTimeQuestion(time) : ''}
          Avatar={isSameSender ? 'no' : sender && user ? user?.avatar : ''}
          Type={currentQuestion.type}
          Sender={currentQuestion.studentId}
          handleDeleteChat={handleDeleteChat}
          handleKickStudent={kickStudent}
          IsRecall={currentQuestion.isResolved}
        />
      );
    }

    return list;
  };

  const loadQuestion = async () => {
    setLoading(true);
    const url = `${localHost}/api/v1/question/findBySubject/${subjectId}?page=1&limit=10000`;
    const response = await get({ url: url, token: accessToken });
    if (response) {
      if (response.status == 200) {
        const list = await response.data;
        setQuestionList(list.questions);
      } else {
        Alert.alert('Thông báo', 'Đã xảy ra lỗi');
      }
    }
    setLoading(false);
  };
  const handleDeleteChat = (Id: string) => {
    const msgList = questionList.filter(value => value._id != Id);
    setQuestionList(msgList);
  }

  const generateID = () => {
    const codeInit = 'qwertyuiopasdfghjklzxcvbnm1234567890';
    let code = '';
    for (let i = 0; i < 10; i++) {
      const index = Math.floor(Math.random() * codeInit.length);
      code += codeInit.charAt(index);
    }
    return code;
  };

  const sendQuestion = async (Type: string, Content: string) => {
    if (!Content || Content == '') {
      Content = message;
      setMessage('');
    }

    const dataPost = {
      subjectId: `${subjectId}`,
      studentId: `${user?.id}`,
      content: Content,
      type: Type,
      isResolved: false
    };

    const idMsg = generateID();

    if (user) {
      const msg: Question = {
        _id: idMsg,
        subjectId: `${subjectId}`,
        content: Content,
        studentId: {
          name: user.name,
          userCode: user.userCode,
          role: user.role,
          avatar: user.avatar,
          id: user.id,
          email: user.email,
          school: user.school
        },
        createdAt: `${new Date().toISOString()}`,
        type: Type,
        isResolved: false,
        updatedAt: `${new Date().toISOString()}`,
        __v: '0',
        id: idMsg
      };

      setQuestionList(prevList => [...prevList, msg]);

      const url = `${localHost}/api/v1/question/add`;

      const response = await post({
        url: url,
        data: dataPost,
        token: accessToken
      });

      if (response) {
        if (socketContext?.socket) {
          const dataMsg = {
            title: `${name}`, //Tên môn học
            body: Type == 'text' ? msg.content : 'Đã gửi một ảnh', //Nội dung tin nhắn
            type: 'message', //Loại tin nhắn
            senderId: user.id, //ID người gửi
            sender: user?.name, //Tên người gửi
            subject: `${name}`, //Tên môn học
            room: '' //Phòng học
          };
          socketContext.socket.emit('sendMessageToSubject', {
            subjectID: subjectId,
            message: msg,
            dataMsg: dataMsg
          });
        }
        if (response.status == 201) {
          let newMsg = msg;
          newMsg._id = response.data.question.id;
          newMsg.id=response.data.question.id;
           const msgList = questionList.filter(value => value._id != idMsg);
           msgList.push(newMsg);
          setQuestionList(msgList);
        }
        if (response.status != 201) {
          const msgList = questionList.filter(value => value._id !== idMsg);
          setQuestionList(msgList);

          Alert.alert('Alert', 'Message could not be sent');
          return false;
        }
      }
    }
  };

  const uploadImage = async (imageUri: string, name: string) => {
    const formData = new FormData();
    const extension = imageUri.split('.').pop();
    if (extension) {
      const type = mime.lookup(extension);
      if (type) {
        formData.append('image', {
          uri: imageUri,
          type: type || 'image/jpeg', // Mặc định là JPEG nếu không xác định được loại
          name: name || 'photo.jpg'
        } as any);
      }
    }
    const url = `${localHost}/api/v1/upload/image`;
    try {
      const response = await post({
        url: url,
        token: accessToken,
        data: formData
      });
      if (response) {
        if (response.status == 200) {
          const json = await response.data;
          console.log(json);
          return json.image;
        } else {
          Alert.alert('Thông báo', 'Không thể gửi');
          return false;
        }
      }
    } catch (error) {
      Alert.alert('Alert', 'Unable to send photo');
      return false;
    } finally {
    }
  };
  const handleChooseImage = async () => {
    let image = [];
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      // allowsEditing: true,
      quality: 1
    });
    if (!result.canceled) {
      setUploading(true);
      const listImage = Array.from(result.assets);
      for (let i = 0; i < listImage.length; i++) {
        const currentTime = new Date();
        const timestamp = currentTime.getTime();
        let imageUri = await uploadImage(
          listImage[i].uri,
          '' + timestamp + user?.id
        );
        if (imageUri) {
          image.push(imageUri);
        }
      }
      const Image = image.join(' ');
      // setMessage(Image);
      if (image.length > 0) await sendQuestion('image', Image);
      // setMessage('');
      setUploading(false);
    }
  };
  const handleCamera = async () => {
    let image;
    let result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      quality: 1
    });
    if (!result.canceled) {
      setUploading(true);
      image = result.assets;
      const currentTime = new Date();
      const timestamp = currentTime.getTime();
      const imageUrl = await uploadImage(
        image[0].uri,
        '' + timestamp + user?.id
      );
      if (imageUrl) {
        sendQuestion('image', imageUrl);
        setMessage('');
      }
    }
  };
  //send
  const handlesendQuestion = async () => {
    setcheckScroll(true);
    await sendQuestion('text', '');
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
      <View className='justify-center h-full flex-1 w-full'>
        <View className=' shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
          <TouchableOpacity onPress={router.back}>
            <Ionicons name='chevron-back-sharp' size={24} color='white' />
          </TouchableOpacity>
          <View className='mx-auto items-center pr-6'>
            <Text className='text-[18px] font-msemibold uppercase text-white'>
              {code}
            </Text>
            <Text className='mt-[-3px] text-white font-mmedium'>Trao đổi</Text>
          </View>
        </View>
        <LinearGradient
          className='h-[1.2px] bg-[#F7F7F7]'
          colors={['#C0BDBD', '#ffffff']}
        />
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <ActivityIndicator size='large' color={colors.blue_primary} animating={true} />
          </View>
        ) : (
          <ScrollView
            className='flex-1 w-full'
            keyboardShouldPersistTaps='handled'
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {renderQuestion()}
          </ScrollView>
        )}
        <LinearGradient className='h-[1px]' colors={['#fafafa', '#d6d4d4']} />
        <View className='h-[60px] w-[90%] ml-[5%] justify-center items-center flex-row'>
          {
            <View className='flex-1 border rounded-3xl px-[10px] border-[#E6E6E6] p-[5px]'>
              <TextInput
                value={message}
                onChangeText={e => setMessage(e)}
                multiline={true}
                placeholder='Message'
              />
            </View>
          }

          {message.trim().length > 0 ? (
            <TouchableOpacity onPress={handlesendQuestion}>
              <Feather
                name='send'
                size={26}
                color='gray'
                style={{ marginLeft: 9, marginTop: 3 }}
              />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={handleCamera}>
                <Feather
                  name='camera'
                  size={27}
                  color='#767676'
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChooseImage}>
                <FontAwesome6
                  name='image'
                  size={24}
                  color='#767676'
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        <Loading loading={isUploading} />
      </View>
    </KeyboardAvoidingView>
  );
}

// registerRootComponent(ScreenChatRoom);
