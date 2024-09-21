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

} from "@chakra-ui/react";
import { ArrowRightIcon, RepeatIcon } from "@chakra-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import { platform } from "os";

export const MusicPlayer = (props: {
  src: string;
  playtime: number;
  nextClick: () => void;
  reset: () => void;
  title: string;
  artists: string[];
  coverImage: string;
}) => {
  const artistString = props.artists.join(', '); // 在组件中处理拼接逻辑
  const audio = useRef<HTMLAudioElement | null>(null);
  const [length, setLength] = useState(100);
  const [time, setTime] = useState(0);
  // const [volume, setVolume] = useState(0.3);
  const [volume, setVolume] = useState(0.2); // 默认音量
  const t = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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

    // 仅当 src 改变时才设置音频源
    if (props.src && audio.current.src !== props.src) {
      audio.current.src = props.src;
      if (props.playtime !== 0) audio.current.currentTime = props.playtime;
    }

    // 设置音量
    audio.current.volume = volume;

    // 避免重新播放
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


  // 处理音量滑块变化
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audio.current) {
      audio.current.volume = newVolume;
    }
  };

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
        //maxW="900px"
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
          >
          </Box>
        </Box>

        {/* 信息与控制区域 */}
        <Box flex={1} width="100%" >
          <Box mb={4} textAlign={{ base: "center", md: "left" }}>
            <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold">{props.title}</Text>
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">{artistString}</Text>
          </Box>

          {/* 进度条和时间显示 */}
          <Flex alignItems="center" mb={4} justifyContent="center">
            <Progress
              value={time}
              max={length}
              w={{ base: "90%", md: "100%" }} // 手机端宽度设置为90%，桌面端100%
              h="12px"
              borderRadius="full"
              bg="gray.300"
              sx={{
                "& > div": { backgroundColor: "#4caf50", borderRadius: "full" }, // 自定义进度条颜色
              }}
            />
          </Flex>

          <Text textAlign="center" fontSize={{ base: "sm", md: "md" }}>{`${formatTime(time)} / ${formatTime(length)}`}</Text>

          {/* 音量控制和按钮区域 */}
          <Flex alignItems="center" justifyContent="space-between" mt={4} direction={{ base: "column", md: "row" }}>
            {/* 音量滑块 */}
            <Box width="100%" maxW={{ base: "200px", md: "300px" }} textAlign="center">
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
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </>
  );
};