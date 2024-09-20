import {
  Flex,
  useDisclosure,
  useToast,
  Box,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";

export const VideoPlayer = (props: {
  src: string;
  playtime: number;
  aid: string;
  bvid: string;
  cid: string;
}) => {
  const videoRef = useRef<HTMLIFrameElement | null>(null);
  const t = useToast();

  useEffect(() => {
    const setResponsiveSize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;


      // 在手机端设置不同的尺寸
      if (windowWidth <= 768) {
        videoRef.current!.style.width = '300px';
        videoRef.current!.style.height = '200px';
      } else {
        // 在PC端设置不同的尺寸
        videoRef.current!.style.width = '800px';
        videoRef.current!.style.height = '500px';
      }
    };

    // 监听窗口大小变化
    window.addEventListener('resize', setResponsiveSize);
    // 初始化时设置一次尺寸
    setResponsiveSize();

    // 当 props 中的 src、playtime、bvid、cid 发生变化时，更新视频播放器状态
    if (videoRef.current) {
      // 构建 Bilibili 视频链接
      const biliUrl = `//player.bilibili.com/player.html?aid=${props.aid}&bvid=${props.bvid}&cid=${props.cid}&p=1&t=${props.playtime + 1}&high_quality=1&autoplay=1&muted=true`;
      // 设置视频的 src 属性
      videoRef.current.src = biliUrl;
      
    };


  return () => {
    // 清除事件监听
    window.removeEventListener('resize', setResponsiveSize);
  };
}, [props.aid, props.bvid, props.cid, props.playtime]);

return (
  <>
    <Flex flexDirection={"row"} alignItems={"center"}>
      <iframe
        ref={videoRef}
        src={props.src}
        allowFullScreen
        frameBorder="0"
        title="Bilibili Video Player"
      ></iframe>
    </Flex>
  </>
);
};