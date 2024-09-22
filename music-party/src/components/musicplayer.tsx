import {
  Button,
  Flex,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  Box,
  Image,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Center,
  Link
} from "@chakra-ui/react";
import { ArrowRightIcon, RepeatIcon, DownloadIcon } from "@chakra-ui/icons"; // 导入 DownloadIcon 图标
import React, { useEffect, useRef, useState } from "react";
import { toastInfo } from "../utils/toast";

export const MusicPlayer = (props: {
  src: string;
  playtime: number;
  nextClick: () => void;
  reset: () => void;
  title: string;
  artists: string[];
  coverImage: string;
  downloadUrl?: string; // 将 downloadUrl 设置为可选属性
  apiname: string
}) => {
  const artistString = props.artists.join(", ");
  const audio = useRef<HTMLAudioElement | null>(null);
  const [length, setLength] = useState(100);
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState(0.2); // 默认音量
  const t = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 下载文件的函数
  const downloadSong = async () => {
    if (!props.downloadUrl) return;
    // 调用 toastInfo 显示下载开始提示
    toastInfo(t, `《${props.title}》已经开始下载，请等待...`);
    try {

      // 获取文件数据
      const response = await fetch(props.downloadUrl);
      const blob = await response.blob(); // 将响应转换为 Blob 对象

      // 创建临时下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // 设置下载的文件名
      link.download = `${props.title} - ${props.artists.join(", ")}.mp3`; // 可以修改为想要的文件名
      document.body.appendChild(link);
      link.click();

      // 移除临时链接
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);



    } catch (error) {
      console.error("下载失败:", error);
      t({
        title: "下载失败",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };


  useEffect(() => {
    if (!audio.current) {
      audio.current = new Audio();
      audio.current.addEventListener("durationchange", () => {
        setLength(audio.current!.duration);
      });
      audio.current.addEventListener("timeupdate", () => {
        setTime(audio.current!.currentTime);
      });
    }

    if (props.src && audio.current.src !== props.src) {
      audio.current.src = props.src;
      if (props.playtime !== 0) audio.current.currentTime = props.playtime;
    }

    audio.current.volume = volume;

    if (audio.current.paused) {
      audio.current.play().catch((e: DOMException) => {
        if (e.message === "The play() request was interrupted because the media was removed from the document.") {
          return;
        }
        console.log(e);
        onOpen();
      });
    }
  }, [props.src, props.playtime, volume]);

  return (
    <>
      <Flex
        direction={{ base: "column", md: "row" }}
        alignItems="center"
        justifyContent="space-between"
        p={4}
        bg="gray.100"
        borderRadius="lg"
        boxShadow="lg"
        w="100%"
        mx="auto"
      >
        {/* 封面区域 */}
        <Box position="relative" mb={{ base: 4, md: 0 }} mr={{ md: 6 }}>
          <Image
            src={props.coverImage}
            alt="封面"
            w={{ base: "240px", md: "300px" }}
            h={{ base: "240px", md: "300px" }}
            borderRadius="full"
            position="absolute"
            top="5%"
            left="5%"
            transform="translate(-50%, -50%)"
            animation="spin 20s linear infinite"
          />
          <Box
            w={{ base: "270px", md: "330px" }}
            h={{ base: "270px", md: "330px" }}
            borderRadius="full"
            background="url('/static_record.png') no-repeat center"
            backgroundSize="contain"
            animation="spin 20s linear infinite"
          ></Box>
        </Box>

        {/* 信息与控制区域 */}
        <Box flex={1} width="100%">
          <Box mb={4} textAlign={{ base: "center", md: "left" }}>
            <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold">
              {props.title}
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
              {artistString}
            </Text>
          </Box>

          {/* 进度条和时间显示 */}
          <Flex alignItems="center" mb={4} justifyContent="center">
            <Progress
              value={time}
              max={length}
              w={{ base: "90%", md: "100%" }}
              h="12px"
              borderRadius="full"
              bg="gray.300"
              sx={{
                "& > div": { backgroundColor: "#4caf50", borderRadius: "full" },
              }}
            />
          </Flex>

          <Text textAlign="center" fontSize={{ base: "sm", md: "md" }}>{`${formatTime(
            time
          )} / ${formatTime(length)}`}</Text>

          {/* 音量控制和按钮区域 */}
          <Flex
            alignItems="center"
            justifyContent="space-between"
            mt={4}
            direction={{ base: "column", md: "row" }}
          >
            {/* 音量滑块 */}
            <Box
              width="100%"
              maxW={{ base: "200px", md: "300px" }}
              textAlign="center"
            >
              <Text fontSize={{ base: "md", md: "lg" }}>音量</Text>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(value) => setVolume(value)}
              >
                <SliderTrack bg="gray.300">
                  <SliderFilledTrack bg="#4caf50" />
                </SliderTrack>
                <SliderThumb boxSize={6} bg="green.500" />
              </Slider>
            </Box>

            {/* 控制按钮 */}
            <Flex mt={{ base: 4, md: 0 }} alignItems="center">
              <Tooltip hasArrow label="刷新，调整音量后点此处同步音频">
                <IconButton
                  aria-label="刷新"
                  icon={<RepeatIcon />}
                  onClick={() => {
                    if (audio.current?.paused) {
                      audio.current?.play();
                    } else {
                      audio.current?.pause();
                    }
                    props.reset();
                  }}
                  mr={2}
                  colorScheme="green"
                  size="lg"
                />
              </Tooltip>

              <Tooltip hasArrow label="切歌">
                <IconButton
                  aria-label="切歌"
                  icon={<ArrowRightIcon />}
                  onClick={props.nextClick}
                  colorScheme="green"
                  size="lg"
                />
              </Tooltip>

              {/* 下载按钮 */}
              {/* 仅当 apiname 不为 'bilibili' 时显示下载按钮 */}
              {props.apiname !== "Bilibili" && (
                <Tooltip hasArrow label="下载歌曲">
                  <IconButton
                    aria-label="下载"
                    icon={<DownloadIcon />}
                    onClick={downloadSong}
                    colorScheme="green"
                    size="lg"
                    ml={2}
                  />
                </Tooltip>
              )}
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </>
  );
};
