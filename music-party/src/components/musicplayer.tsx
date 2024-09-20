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
} from "@chakra-ui/react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import { platform } from "os";

export const MusicPlayer = (props: {
  src: string;
  playtime: number;
  nextClick: () => void;
  reset: () => void;
}) => {
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
      <Flex flexDirection={"row"} alignItems={"center"}>
        <Progress flex={12} height={"32px"} max={length} value={time} />
        {/* <Text flex={2} textAlign={"center"}>{${Math.floor(
          time
        )} / ${Math.floor(length)}}</Text> */}
        <Text flex={2} textAlign={"center"}>{`${formatTime(time)} / ${formatTime(length)}`}</Text>
        {/* <Tooltip hasArrow label="当音乐没有自动播放时，点我试试">
          <IconButton
            flex={1}
            aria-label={"Play"}
            mr={2}
            icon={
              <Icon viewBox="0 0 1024 1024">
                <path
                  d="M128 138.666667c0-47.232 33.322667-66.666667 74.176-43.562667l663.146667 374.954667c40.96 23.168 40.853333 60.8 0 83.882666L202.176 928.896C161.216 952.064 128 932.565333 128 885.333333v-746.666666z"
                  fill="#3D3D3D"
                  p-id="2949"
                ></path>
              </Icon>
            }
            onClick={() => {
              audio.current?.play();
              audio.current?.pause();
              props.reset();
            }}
          />
        </Tooltip> */}
        <Tooltip hasArrow label="刷新，调整音量后点此处同步音频">
          <IconButton
            flex={1}
            aria-label={"Play"}
            mr={2}
            icon={
              <Icon viewBox="0 0 1024 1024">
                <path d="M128 138.666667c0-47.232 33.322667-66.666667 74.176-43.562667l663.146667 374.954667c40.96 23.168 40.853333 60.8 0 83.882666L202.176 928.896C161.216 952.064 128 932.565333 128 885.333333v-746.666666z" fill="#3D3D3D" p-id="2949"></path>
              </Icon>
            }
            onClick={() => {
              if (audio.current?.paused) {
                audio.current?.play();
              } else {
                audio.current?.pause();
              }
              props.reset();
            }}
          />
        </Tooltip>
        <Tooltip hasArrow label={"切歌"}>
          <IconButton
            flex={1}
            icon={<ArrowRightIcon />}
            aria-label={"切歌"}
            onClick={props.nextClick}
          />
        </Tooltip>

      </Flex>
      {/* 包裹音量滑块的 Box */}
      {/* <Box width="100px" mt="4">
        <Text>
          调整音量
        </Text>
        <label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
          />
        </label>
      </Box> */}
      <Box width="100px" mt="4">
        <Text>调整音量</Text>
        <label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </label>
      </Box>
    </>
  );
};